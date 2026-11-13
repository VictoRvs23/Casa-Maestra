import { AppDataSource } from "../config/configDb.js";
import NotificacionEntity from "../entities/notificacion.entity.js";

const notificacionRepository = AppDataSource.getRepository(NotificacionEntity);

export const MAX_NOTIFICACIONES_POR_USUARIO = 100;

const contarNoLeidas = (id_usuario) =>
    notificacionRepository.count({ where: { usuario: { id_usuario }, leida: false } });

export const crearNotificacionService = async (id_usuario, { tipo, titulo, mensaje, enlace = null }) => {
    try {
        if (!id_usuario) return null;

        const nueva = await notificacionRepository.save(
            notificacionRepository.create({
                usuario: { id_usuario },
                tipo,
                titulo: String(titulo).slice(0, 120),
                mensaje: String(mensaje).slice(0, 300),
                enlace,
            })
        );

        await limpiarAntiguas(id_usuario);
        return nueva;
    } catch (error) {
        console.error("No se pudo crear la notificación:", error.message);
        return null;
    }
};

const limpiarAntiguas = async (id_usuario) => {
    const sobrantes = await notificacionRepository.find({
        where: { usuario: { id_usuario } },
        select: { id_notificacion: true },
        order: { created_at: "DESC", id_notificacion: "DESC" },
        skip: MAX_NOTIFICACIONES_POR_USUARIO,
    });

    if (sobrantes.length > 0) {
        await notificacionRepository.delete(sobrantes.map((n) => n.id_notificacion));
    }
};

export const crearOActualizarNoLeidaService = async (id_usuario, datos) => {
    try {
        const existente = await notificacionRepository.findOne({
            where: { usuario: { id_usuario }, tipo: datos.tipo, leida: false },
            order: { created_at: "DESC" },
        });

        if (!existente) return await crearNotificacionService(id_usuario, datos);

        await notificacionRepository.update(existente.id_notificacion, {
            titulo: String(datos.titulo).slice(0, 120),
            mensaje: String(datos.mensaje).slice(0, 300),
            enlace: datos.enlace ?? null,
            created_at: new Date(),
        });
        return existente;
    } catch (error) {
        console.error("No se pudo actualizar la notificación:", error.message);
        return null;
    }
};

export const getMisNotificacionesService = async (id_usuario, { limit = 20, page = 1 } = {}) => {
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);

    const [notificaciones, total] = await notificacionRepository.findAndCount({
        where: { usuario: { id_usuario } },
        order: { created_at: "DESC", id_notificacion: "DESC" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
    });

    return {
        notificaciones,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        no_leidas: await contarNoLeidas(id_usuario),
    };
};

export const getContadorService = async (id_usuario) => ({ no_leidas: await contarNoLeidas(id_usuario) });

export const marcarLeidaService = async (id_usuario, id_notificacion) => {
    const notificacion = await notificacionRepository.findOne({
        where: { id_notificacion, usuario: { id_usuario } },
    });
    if (!notificacion) throw { status: 404, message: "No encontramos esa notificación." };

    if (!notificacion.leida) await notificacionRepository.update(id_notificacion, { leida: true });
    return { id_notificacion, leida: true, no_leidas: await contarNoLeidas(id_usuario) };
};

export const marcarTodasLeidasService = async (id_usuario) => {
    await notificacionRepository.update({ usuario: { id_usuario }, leida: false }, { leida: true });
    return { no_leidas: 0 };
};

export const eliminarNotificacionService = async (id_usuario, id_notificacion) => {
    const notificacion = await notificacionRepository.findOne({
        where: { id_notificacion, usuario: { id_usuario } },
    });
    if (!notificacion) throw { status: 404, message: "No encontramos esa notificación." };

    await notificacionRepository.delete(id_notificacion);
    return { id_notificacion, no_leidas: await contarNoLeidas(id_usuario) };
};