"use strict";
import * as notificacionService from "../services/notificacion.services.js";
import {
    IdNotificacionParamValidation,
    ListarNotificacionesQueryValidation,
} from "../validations/notificacion.validation.js";

const manejar = (nombre, mensaje, fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error(`Error en ${nombre}:`, error);
        res.status(500).json({ message: mensaje });
    }
};

export const getMisNotificaciones = manejar(
    "getMisNotificaciones",
    "Error interno al obtener tus notificaciones",
    async (req, res) => {
        const { error, value } = ListarNotificacionesQueryValidation.validate(req.query);
        if (error) return res.status(400).json({ message: error.details[0].message });
        res.status(200).json(await notificacionService.getMisNotificacionesService(req.usuario.id_usuario, value));
    }
);

export const getContador = manejar("getContador", "Error interno al contar tus notificaciones", async (req, res) => {
    res.status(200).json(await notificacionService.getContadorService(req.usuario.id_usuario));
});

export const marcarLeida = manejar("marcarLeida", "Error interno al marcar la notificación", async (req, res) => {
    const { error, value } = IdNotificacionParamValidation.validate(req.params);
    if (error) return res.status(400).json({ message: error.details[0].message });
    res.status(200).json(await notificacionService.marcarLeidaService(req.usuario.id_usuario, value.id_notificacion));
});

export const marcarTodasLeidas = manejar(
    "marcarTodasLeidas",
    "Error interno al marcar tus notificaciones",
    async (req, res) => {
        res.status(200).json(await notificacionService.marcarTodasLeidasService(req.usuario.id_usuario));
    }
);

export const eliminarNotificacion = manejar(
    "eliminarNotificacion",
    "Error interno al eliminar la notificación",
    async (req, res) => {
        const { error, value } = IdNotificacionParamValidation.validate(req.params);
        if (error) return res.status(400).json({ message: error.details[0].message });
        res.status(200).json(
            await notificacionService.eliminarNotificacionService(req.usuario.id_usuario, value.id_notificacion)
        );
    }
);