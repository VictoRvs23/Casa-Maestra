import { AppDataSource } from "../config/configDb.js";
import ReservaEntity from "../entities/reserva.entity.js";
import AgendaEntity from "../entities/agenda.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";
import {
    ahoraEnChile,
    aHora,
    aMinutos,
    diaSemanaDe,
    esFechaValida,
    estadoDeLasHoras,
    fechasDelMes,
    normalizarHora,
    validarRango,
} from "../helpers/horarios.helper.js";
import {
    detalleReserva,
    notificarReservaConfirmada,
    notificarReservaCancelada,
    notificarStaffReservaNueva,
    notificarStaffReservaCancelada,
} from "./notificacion.eventos.js";

const reservaRepository = AppDataSource.getRepository(ReservaEntity);
const agendaRepository = AppDataSource.getRepository(AgendaEntity);
const estudioRepository = AppDataSource.getRepository(EstudioEntity);

const simplificar = (reservas) =>
    reservas.map((r) => ({ hora_inicio: normalizarHora(r.hora_inicio), hora_fin: normalizarHora(r.hora_fin) }));

const bloquesSimples = (bloques) =>
    bloques.map((b) => ({
        dia_semana: b.dia_semana,
        hora_inicio: normalizarHora(b.hora_inicio),
        hora_fin: normalizarHora(b.hora_fin),
    }));

export const getEstudio0Service = async () => {
    const estudio = await estudioRepository.findOneBy({ tipo_arriendo: "por_hora" });
    if (!estudio) throw { status: 404, message: "El Estudio 0 aún no está creado." };
    return estudio;
};

export const getDisponibilidadService = async (mes) => {
    const estudio = await getEstudio0Service();
    const fechas = fechasDelMes(mes);

    const bloques = bloquesSimples(
        await agendaRepository.find({
            where: { estudio: { id_estudio: estudio.id_estudio }, activo: true },
        })
    );

    const reservas = await reservaRepository
        .createQueryBuilder("r")
        .where("r.id_estudio = :id", { id: estudio.id_estudio })
        .andWhere("r.estado = :estado", { estado: "confirmada" })
        .andWhere("r.fecha BETWEEN :desde AND :hasta", { desde: fechas[0], hasta: fechas[fechas.length - 1] })
        .getMany();

    const ahora = ahoraEnChile();

    const dias = fechas.map((fecha) => {
        const delDia = bloques.filter((b) => b.dia_semana === diaSemanaDe(fecha));
        const reservasDelDia = simplificar(reservas.filter((r) => r.fecha === fecha));
        const horas = estadoDeLasHoras({ fecha, bloques: delDia, reservas: reservasDelDia, ahora });
        return { fecha, abierto: horas.length > 0, horas };
    });

    return { id_estudio: estudio.id_estudio, precio: estudio.precio, disponible: estudio.disponible, mes, dias };
};

export const crearReservaService = async (id_usuario, { fecha, hora_inicio, hora_fin }) => {
    const estudio = await getEstudio0Service();

    if (!estudio.disponible) {
        throw { status: 409, message: "El Estudio 0 no está disponible por ahora." };
    }
    if (!esFechaValida(fecha)) {
        throw { status: 400, message: "La fecha no es válida." };
    }

    const resultado = await AppDataSource.transaction(async (manager) => {
        await manager.query("SELECT pg_advisory_xact_lock($1)", [estudio.id_estudio]);

        const bloques = bloquesSimples(
            await manager.getRepository(AgendaEntity).find({
                where: { estudio: { id_estudio: estudio.id_estudio }, dia_semana: diaSemanaDe(fecha), activo: true },
            })
        );

        const reservas = simplificar(
            await manager.getRepository(ReservaEntity).find({
                where: { estudio: { id_estudio: estudio.id_estudio }, fecha, estado: "confirmada" },
            })
        );

        const problema = validarRango({
            fecha,
            hora_inicio,
            hora_fin,
            bloques,
            reservas,
            ahora: ahoraEnChile(),
        });
        if (problema) throw problema;

        const repo = manager.getRepository(ReservaEntity);
        const guardada = await repo.save(
            repo.create({
                fecha,
                hora_inicio,
                hora_fin,
                estado: "confirmada",
                estudio: { id_estudio: estudio.id_estudio },
                usuario: { id_usuario: parseInt(id_usuario) },
            })
        );

        const horas = (aMinutos(hora_fin) - aMinutos(hora_inicio)) / 60;
        return { ...guardada, horas, total: horas * estudio.precio };
    });

    await notificarReservaConfirmada(id_usuario, detalleReserva({ fecha, hora_inicio, hora_fin }));
    await notificarStaffReservaNueva(id_usuario, { fecha, hora_inicio, hora_fin });

    return resultado;
};

export const cancelarReservaService = async (id_reserva, id_usuario, rolUsuario) => {
    const reserva = await reservaRepository.findOne({
        where: { id_reserva: parseInt(id_reserva) },
        relations: ["usuario"],
    });
    if (!reserva) throw { status: 404, message: "Reserva no encontrada" };

    const esDueño = String(reserva.usuario.id_usuario) === String(id_usuario);
    const esGestor = rolUsuario === "Admin" || rolUsuario === "Fundador/a";
    if (!esDueño && !esGestor) {
        throw { status: 403, message: "No puedes cancelar una reserva que no es tuya." };
    }

    const yaCancelada = reserva.estado === "cancelada";
    await reservaRepository.update(id_reserva, { estado: "cancelada" });

    if (!yaCancelada) {
        const detalle = detalleReserva(reserva);
        await notificarReservaCancelada(reserva.usuario.id_usuario, detalle, !esDueño);
        await notificarStaffReservaCancelada(id_usuario, reserva.usuario.id_usuario, reserva);
    }
    return true;
};

export const getMisReservasService = async (id_usuario) => {
    return await reservaRepository.find({
        where: { usuario: { id_usuario: parseInt(id_usuario) } },
        relations: ["estudio"],
        order: { fecha: "DESC", hora_inicio: "DESC" },
    });
};

export const PERIODOS_RESERVAS = ["proximas", "pasadas", "canceladas", "todas"];

const aplicarPeriodo = (qb, periodo, hoy, hora) => {
    const futura = "(r.fecha > :hoy OR (r.fecha = :hoy AND r.hora_fin > :hora))";
    switch (periodo) {
        case "proximas":
            return qb.andWhere("r.estado = 'confirmada'").andWhere(futura, { hoy, hora });
        case "pasadas":
            return qb.andWhere("r.estado = 'confirmada'").andWhere("NOT " + futura, { hoy, hora });
        case "canceladas":
            return qb.andWhere("r.estado = 'cancelada'");
        default:
            return qb;
    }
};

export const getReservasService = async ({ periodo = "proximas", page = 1, limit = 10 }) => {
    const estudio = await getEstudio0Service();
    const ahora = ahoraEnChile();
    const hoy = ahora.fecha;
    const hora = aHora(ahora.minutos);

    const qb = reservaRepository
        .createQueryBuilder("r")
        .leftJoin("r.usuario", "u")
        .select([
            "r.id_reserva",
            "r.fecha",
            "r.hora_inicio",
            "r.hora_fin",
            "r.estado",
            "r.created_at",
            "u.id_usuario",
            "u.nombre",
            "u.apellido",
            "u.email",
            "u.telefono",
        ])
        .where("r.id_estudio = :id", { id: estudio.id_estudio });

    aplicarPeriodo(qb, periodo, hoy, hora);

    const ascendente = periodo === "proximas";
    const orden = ascendente ? "ASC" : "DESC";
    const [filas, total] = await qb
        .orderBy("r.fecha", orden)
        .addOrderBy("r.hora_inicio", orden)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    const cuentas = {};
    for (const p of PERIODOS_RESERVAS) {
        const q = reservaRepository.createQueryBuilder("r").where("r.id_estudio = :id", { id: estudio.id_estudio });
        cuentas[p] = await aplicarPeriodo(q, p, hoy, hora).getCount();
    }

    const reservas = filas.map((r) => {
        const horas = (aMinutos(r.hora_fin) - aMinutos(r.hora_inicio)) / 60;
        return {
            id_reserva: r.id_reserva,
            fecha: r.fecha,
            hora_inicio: normalizarHora(r.hora_inicio),
            hora_fin: normalizarHora(r.hora_fin),
            estado: r.estado,
            horas,
            total: horas * estudio.precio,
            created_at: r.created_at,
            usuario: r.usuario
                ? {
                    id_usuario: r.usuario.id_usuario,
                    nombre: r.usuario.nombre,
                    apellido: r.usuario.apellido,
                    email: r.usuario.email,
                    telefono: r.usuario.telefono,
                }
                : null,
        };
    });

    return { reservas, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), cuentas };
};