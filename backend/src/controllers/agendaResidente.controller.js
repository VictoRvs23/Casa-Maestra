"use strict";
import * as agenda from "../services/agendaResidente.services.js";

const responderError = (res, error, etiqueta) => {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error(`Error en ${etiqueta}:`, error);
    return res.status(500).json({ message: "Error interno del servidor" });
};

export const getMisServicios = async (req, res) => {
    try {
        const servicios = await agenda.getMisServiciosService(req.usuario.id_usuario);
        res.status(200).json({ servicios, maximo: agenda.MAX_SERVICIOS });
    } catch (error) {
        responderError(res, error, "getMisServicios");
    }
};

export const crearServicio = async (req, res) => {
    try {
        const servicio = await agenda.crearServicioService(req.usuario.id_usuario, req.body, req.file);
        res.status(201).json({ message: "Servicio creado", servicio });
    } catch (error) {
        responderError(res, error, "crearServicio");
    }
};

export const actualizarServicio = async (req, res) => {
    try {
        const servicio = await agenda.actualizarServicioService(
            req.usuario.id_usuario,
            req.params.id_servicio,
            req.body,
            req.file
        );
        res.status(200).json({ message: "Servicio actualizado", servicio });
    } catch (error) {
        responderError(res, error, "actualizarServicio");
    }
};

export const eliminarServicio = async (req, res) => {
    try {
        await agenda.eliminarServicioService(req.usuario.id_usuario, req.params.id_servicio);
        res.status(200).json({ message: "Servicio eliminado" });
    } catch (error) {
        responderError(res, error, "eliminarServicio");
    }
};

export const getMisHorarios = async (req, res) => {
    try {
        const bloques = await agenda.getMisHorariosService(req.usuario.id_usuario);
        res.status(200).json({ bloques });
    } catch (error) {
        responderError(res, error, "getMisHorarios");
    }
};

export const guardarMisHorarios = async (req, res) => {
    try {
        const bloques = await agenda.guardarMisHorariosService(req.usuario.id_usuario, req.body.bloques);
        res.status(200).json({ message: "Horarios guardados", bloques });
    } catch (error) {
        responderError(res, error, "guardarMisHorarios");
    }
};

export const getOfertaPublica = async (req, res) => {
    try {
        res.status(200).json(await agenda.getOfertaPublicaService(req.params.slug));
    } catch (error) {
        responderError(res, error, "getOfertaPublica");
    }
};