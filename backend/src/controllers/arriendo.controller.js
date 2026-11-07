"use strict";
import * as arriendoService from "../services/arriendo.services.js";
import {
    CrearArriendoValidation,
    DisponibilidadArriendosQueryValidation,
    ListadoArriendosQueryValidation,
} from "../validations/arriendo.validation.js";

const manejar = (nombre, mensaje, fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error(`Error en ${nombre}:`, error);
        res.status(500).json({ message: mensaje });
    }
};

export const getDisponibilidadArriendos = manejar(
    "getDisponibilidadArriendos",
    "Error interno al obtener la disponibilidad",
    async (req, res) => {
        const { error, value } = DisponibilidadArriendosQueryValidation.validate(req.query);
        if (error) return res.status(400).json({ message: error.details[0].message });
        res.status(200).json(await arriendoService.getDisponibilidadArriendosService(value.cantidad));
    }
);

export const crearArriendo = manejar("crearArriendo", "Error interno al crear el arriendo", async (req, res) => {
    const { error, value } = CrearArriendoValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const arriendo = await arriendoService.crearArriendoService(req.usuario.id_usuario, value);
    res.status(201).json({ message: "Arriendo confirmado", arriendo });
});

export const cancelarArriendo = manejar("cancelarArriendo", "Error interno al cancelar el arriendo", async (req, res) => {
    await arriendoService.cancelarArriendoService(req.params.id_arriendo, req.usuario.id_usuario, req.usuario.rol);
    res.status(200).json({ message: "Arriendo cancelado" });
});

export const getMisArriendos = manejar("getMisArriendos", "Error interno al obtener tus arriendos", async (req, res) => {
    res.status(200).json(await arriendoService.getMisArriendosService(req.usuario.id_usuario));
});

export const getArriendos = manejar("getArriendos", "Error interno al obtener los arriendos", async (req, res) => {
    const { error, value } = ListadoArriendosQueryValidation.validate(req.query);
    if (error) return res.status(400).json({ message: error.details[0].message });
    res.status(200).json(await arriendoService.getArriendosService(value));
});