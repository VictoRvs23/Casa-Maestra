import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import ServicioResidenteEntity from "../entities/servicioResidente.entity.js";
import HorarioResidenteEntity from "../entities/horarioResidente.entity.js";
import CitaResidenteEntity from "../entities/citaResidente.entity.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import { buscarPorSlug, esVisible } from "./tarjeta.services.js";
import { notificarCitaNueva, notificarCitaRespondida, notificarCitaCancelada } from "./notificacion.citas.js";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const servicioRepository = AppDataSource.getRepository(ServicioResidenteEntity);
const horarioRepository = AppDataSource.getRepository(HorarioResidenteEntity);
const citaRepository = AppDataSource.getRepository(CitaResidenteEntity);
const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

const PASO_MIN = 30;
const DIAS_VISTA = 30;
const ANTELACION_MIN = 60;
const MAX_PENDIENTES = 3;
const ESTADOS_QUE_OCUPAN = ["pendiente", "aceptada"];

const aMinutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const aHora = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const ahoraChile = () => {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());
    const g = (t) => partes.find((p) => p.type === t).value;
    return { fecha: `${g("year")}-${g("month")}-${g("day")}`, minutos: Number(g("hour")) * 60 + Number(g("minute")) };
};

const sumarDias = (fecha, n) => {
    const [a, m, d] = fecha.split("-").map(Number);
    return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
};

const diaSemanaDe = (fecha) => new Date(`${fecha}T12:00:00Z`).getUTCDay();

const fechaValida = (fecha) =>
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(`${fecha}T12:00:00Z`)) && sumarDias(fecha, 0) === fecha;

const calcularHoras = ({ bloques, citas, duracion, fecha, ahora }) => {
    const ocupadas = citas.map((c) => ({ ini: aMinutos(c.hora_inicio), fin: aMinutos(c.hora_fin) }));
    const minimo = fecha === ahora.fecha ? ahora.minutos + ANTELACION_MIN : -1;
    const horas = new Set();

    for (const b of bloques) {
        const fin = aMinutos(b.hora_fin);
        for (let t = aMinutos(b.hora_inicio); t + duracion <= fin; t += PASO_MIN) {
            if (t < minimo) continue;
            if (ocupadas.some((o) => t < o.fin && t + duracion > o.ini)) continue;
            horas.add(t);
        }
    }
    return [...horas].sort((a, b) => a - b).map(aHora);
};

const getResidenteVisible = async (slug) => {
    const residente = await buscarPorSlug(slug);
    if (!residente || !(await esVisible(residente))) {
        throw { status: 404, message: "Esta página no está disponible." };
    }
    return residente;
};

const getResidenteDeUsuario = async (id_usuario) => {
    const residente = await residenteRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
    if (!residente) throw { status: 404, message: "No tienes una tarjeta de residente." };
    return residente;
};

const nombreDe = async (id_usuario) => {
    const u = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
    return u ? `${u.nombre} ${u.apellido}`.trim() : "Un usuario";
};

const citaPasada = (cita) => {
    if (!cita.fecha) return false;
    const ahora = ahoraChile();
    return cita.fecha < ahora.fecha || (cita.fecha === ahora.fecha && aMinutos(cita.hora_fin) <= ahora.minutos);
};

export const getDisponibilidadService = async (slug, id_servicio) => {
    const residente = await getResidenteVisible(slug);
    const servicio = await servicioRepository.findOneBy({
        id_servicio: parseInt(id_servicio),
        id_residente: residente.id_residente,
        activo: true,
    });
    if (!servicio) throw { status: 404, message: "Ese servicio no está disponible." };
    if (servicio.tipo !== "servicio") throw { status: 400, message: "Los productos no necesitan elegir una hora." };

    const ahora = ahoraChile();
    const hasta = sumarDias(ahora.fecha, DIAS_VISTA);

    const bloques = await horarioRepository.find({ where: { id_residente: residente.id_residente } });
    const citas = await citaRepository
        .createQueryBuilder("c")
        .where("c.id_residente = :id", { id: residente.id_residente })
        .andWhere("c.estado IN (:...estados)", { estados: ESTADOS_QUE_OCUPAN })
        .andWhere("c.fecha BETWEEN :desde AND :hasta", { desde: ahora.fecha, hasta })
        .getMany();

    const dias = [];
    for (let i = 0; i <= DIAS_VISTA; i++) {
        const fecha = sumarDias(ahora.fecha, i);
        const horas = calcularHoras({
            bloques: bloques.filter((b) => b.dia_semana === diaSemanaDe(fecha)),
            citas: citas.filter((c) => c.fecha === fecha),
            duracion: servicio.duracion_min,
            fecha,
            ahora,
        });
        if (horas.length > 0) dias.push({ fecha, horas });
    }

    return {
        servicio: { id_servicio: servicio.id_servicio, nombre: servicio.nombre, duracion_min: servicio.duracion_min },
        dias,
    };
};

export const crearCitaService = async (id_usuario, { id_servicio, fecha, hora_inicio, nota }) => {
    const servicio = await servicioRepository.findOneBy({ id_servicio: parseInt(id_servicio) });
    if (!servicio || !servicio.activo) throw { status: 404, message: "Ese servicio no está disponible." };

    const residente = await residenteRepository.findOneBy({ id_residente: servicio.id_residente });
    if (!residente || !(await esVisible(residente))) {
        throw { status: 404, message: "Esta página no está disponible." };
    }
    if (residente.id_usuario === parseInt(id_usuario)) {
        throw { status: 403, message: "No puedes agendar contigo mismo." };
    }

    const pendientes = await citaRepository.countBy({
        id_residente: residente.id_residente,
        id_usuario: parseInt(id_usuario),
        estado: "pendiente",
    });
    if (pendientes >= MAX_PENDIENTES) {
        throw {
            status: 409,
            message: `Ya tienes ${MAX_PENDIENTES} solicitudes pendientes con este residente. Espera su respuesta.`,
        };
    }

    const base = {
        id_residente: residente.id_residente,
        id_servicio: servicio.id_servicio,
        id_usuario: parseInt(id_usuario),
        tipo: servicio.tipo,
        nombre_servicio: servicio.nombre,
        precio: servicio.precio,
        duracion_min: servicio.duracion_min,
        nota: nota ? String(nota).trim() || null : null,
        estado: "pendiente",
    };

    let guardada;

    if (servicio.tipo === "producto") {
        guardada = await citaRepository.save(citaRepository.create({ ...base, fecha: null, hora_inicio: null, hora_fin: null }));
    } else {
        if (!fecha || !hora_inicio) throw { status: 400, message: "Elige un día y una hora." };
        if (!fechaValida(fecha)) throw { status: 400, message: "La fecha no es válida." };

        const ahora = ahoraChile();
        if (fecha < ahora.fecha || fecha > sumarDias(ahora.fecha, DIAS_VISTA)) {
            throw { status: 400, message: `Solo puedes agendar dentro de los próximos ${DIAS_VISTA} días.` };
        }

        guardada = await AppDataSource.transaction(async (manager) => {
            await manager.query("SELECT pg_advisory_xact_lock(2, $1)", [residente.id_residente]);

            const bloques = await manager.getRepository(HorarioResidenteEntity).find({
                where: { id_residente: residente.id_residente, dia_semana: diaSemanaDe(fecha) },
            });
            const citas = await manager.getRepository(CitaResidenteEntity).find({
                where: { id_residente: residente.id_residente, fecha, estado: In(ESTADOS_QUE_OCUPAN) },
            });

            const libres = calcularHoras({ bloques, citas, duracion: servicio.duracion_min, fecha, ahora });
            if (!libres.includes(hora_inicio)) {
                throw { status: 409, message: "Esa hora ya no está disponible. Elige otra." };
            }

            const repo = manager.getRepository(CitaResidenteEntity);
            return await repo.save(
                repo.create({
                    ...base,
                    fecha,
                    hora_inicio,
                    hora_fin: aHora(aMinutos(hora_inicio) + servicio.duracion_min),
                })
            );
        });
    }

    if (residente.id_usuario) {
        await notificarCitaNueva(residente.id_usuario, guardada, await nombreDe(id_usuario));
    }
    return guardada;
};

const aVistaCliente = (c) => ({
    id_cita: c.id_cita,
    tipo: c.tipo,
    nombre_servicio: c.nombre_servicio,
    precio: c.precio,
    duracion_min: c.duracion_min,
    fecha: c.fecha,
    hora_inicio: c.hora_inicio,
    hora_fin: c.hora_fin,
    nota: c.nota,
    estado: c.estado,
    pasada: citaPasada(c),
    created_at: c.created_at,
    residente: c.residente ? { nombre: c.residente.nombre, slug: c.residente.slug } : null,
});

export const getMisCitasService = async (id_usuario) => {
    const citas = await citaRepository.find({
        where: { id_usuario: parseInt(id_usuario) },
        relations: { residente: true },
        order: { created_at: "DESC" },
    });
    return citas.map(aVistaCliente);
};

export const cancelarCitaService = async (id_cita, id_usuario) => {
    const cita = await citaRepository.findOne({
        where: { id_cita: parseInt(id_cita) },
        relations: { residente: true, usuario: true },
    });
    if (!cita) throw { status: 404, message: "Cita no encontrada." };

    const esCliente = cita.id_usuario === parseInt(id_usuario);
    const esResidente = cita.residente?.id_usuario === parseInt(id_usuario);
    if (!esCliente && !esResidente) throw { status: 403, message: "No puedes cancelar esta cita." };

    if (!ESTADOS_QUE_OCUPAN.includes(cita.estado)) {
        throw { status: 409, message: "Esta cita ya no se puede cancelar." };
    }
    if (citaPasada(cita)) throw { status: 409, message: "Esta cita ya pasó." };

    await citaRepository.update(cita.id_cita, { estado: "cancelada" });
    cita.estado = "cancelada";

    if (esCliente && cita.residente?.id_usuario) {
        await notificarCitaCancelada(cita.residente.id_usuario, cita, await nombreDe(id_usuario), true);
    } else if (esResidente && cita.id_usuario) {
        await notificarCitaCancelada(cita.id_usuario, cita, cita.residente.nombre, false);
    }
    return cita;
};

export const getCitasResidenteService = async (id_usuario) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const citas = await citaRepository.find({
        where: { id_residente: residente.id_residente },
        relations: { usuario: true },
        order: { created_at: "DESC" },
    });

    return citas.map((c) => ({
        id_cita: c.id_cita,
        tipo: c.tipo,
        nombre_servicio: c.nombre_servicio,
        precio: c.precio,
        duracion_min: c.duracion_min,
        fecha: c.fecha,
        hora_inicio: c.hora_inicio,
        hora_fin: c.hora_fin,
        nota: c.nota,
        estado: c.estado,
        pasada: citaPasada(c),
        created_at: c.created_at,
        cliente: c.usuario
            ? {
                nombre: `${c.usuario.nombre} ${c.usuario.apellido}`.trim(),
                telefono: c.usuario.telefono || null,
                email: c.usuario.email || null,
            }
            : { nombre: "Usuario eliminado", telefono: null, email: null },
    }));
};

export const responderCitaService = async (id_usuario, id_cita, accion) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const cita = await citaRepository.findOneBy({ id_cita: parseInt(id_cita), id_residente: residente.id_residente });
    if (!cita) throw { status: 404, message: "Cita no encontrada." };
    if (cita.estado !== "pendiente") throw { status: 409, message: "Esta solicitud ya fue respondida." };

    const aceptar = accion === "aceptar";
    if (aceptar && citaPasada(cita)) {
        throw { status: 409, message: "Esa hora ya pasó. Puedes rechazar la solicitud." };
    }

    await citaRepository.update(cita.id_cita, { estado: aceptar ? "aceptada" : "rechazada" });
    cita.estado = aceptar ? "aceptada" : "rechazada";

    if (cita.id_usuario) await notificarCitaRespondida(cita.id_usuario, cita, residente.nombre, aceptar);
    return cita;
};

export const contarAgendasDelMesService = async (id_residente) => {
    const desde = `${ahoraChile().fecha.slice(0, 7)}-01`;
    return await citaRepository
        .createQueryBuilder("c")
        .where("c.id_residente = :id", { id: id_residente })
        .andWhere("c.estado = 'aceptada'")
        .andWhere("c.created_at >= :desde", { desde })
        .getCount();
};
