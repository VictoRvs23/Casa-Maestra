import { AppDataSource } from "../config/configDb.js";
import ReservaEntity from "../entities/reserva.entity.js";
import AgendaEntity from "../entities/agenda.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";
import {
    ahoraEnChile,
    aMinutos,
    diaSemanaDe,
    esFechaValida,
    estadoDeLasHoras,
    fechasDelMes,
    normalizarHora,
    validarRango,
} from "../helpers/horarios.helper.js";

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

    return await AppDataSource.transaction(async (manager) => {
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

    await reservaRepository.update(id_reserva, { estado: "cancelada" });
    return true;
};

export const getMisReservasService = async (id_usuario) => {
    return await reservaRepository.find({
        where: { usuario: { id_usuario: parseInt(id_usuario) } },
        relations: ["estudio"],
        order: { fecha: "DESC", hora_inicio: "DESC" },
    });
};