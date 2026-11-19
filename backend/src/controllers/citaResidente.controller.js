"use strict";
import * as citas from "../services/citaResidente.services.js";

const responderError = (res, error, etiqueta) => {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error(`Error en ${etiqueta}:`, error);
    return res.status(500).json({ message: "Error interno del servidor" });
};

export const getDisponibilidad = async (req, res) => {
    try {
        res.status(200).json(await citas.getDisponibilidadService(req.params.slug, req.query.id_servicio));
    } catch (error) {
        responderError(res, error, "getDisponibilidad");
    }
};

export const crearCita = async (req, res) => {
    try {
        const cita = await citas.crearCitaService(req.usuario.id_usuario, req.body);
        res.status(201).json({ message: "Solicitud enviada", cita });
    } catch (error) {
        responderError(res, error, "crearCita");
    }
};

export const getMisCitas = async (req, res) => {
    try {
        res.status(200).json({ citas: await citas.getMisCitasService(req.usuario.id_usuario) });
    } catch (error) {
        responderError(res, error, "getMisCitas");
    }
};

export const cancelarCita = async (req, res) => {
    try {
        await citas.cancelarCitaService(req.params.id_cita, req.usuario.id_usuario);
        res.status(200).json({ message: "Cita cancelada" });
    } catch (error) {
        responderError(res, error, "cancelarCita");
    }
};

export const getCitasResidente = async (req, res) => {
    try {
        res.status(200).json({ citas: await citas.getCitasResidenteService(req.usuario.id_usuario) });
    } catch (error) {
        responderError(res, error, "getCitasResidente");
    }
};

export const responderCita = async (req, res) => {
    try {
        const cita = await citas.responderCitaService(req.usuario.id_usuario, req.params.id_cita, req.body.accion);
        res.status(200).json({ message: cita.estado === "aceptada" ? "Cita aceptada" : "Cita rechazada", cita });
    } catch (error) {
        responderError(res, error, "responderCita");
    }
};
