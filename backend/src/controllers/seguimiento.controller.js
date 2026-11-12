"use strict";
import * as seguimientoService from "../services/seguimiento.services.js";
import { ResidenteParamValidation } from "../validations/seguimiento.validation.js";

const manejar = (nombre, mensaje, fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error(`Error en ${nombre}:`, error);
        res.status(500).json({ message: mensaje });
    }
};

export const getResumenSeguidores = manejar(
    "getResumenSeguidores",
    "Error interno al obtener los seguidores",
    async (req, res) => {
        res.status(200).json(await seguimientoService.getResumenSeguidoresService(req.params.slug));
    }
);

export const getMisSeguidos = manejar("getMisSeguidos", "Error interno al obtener tus seguidos", async (req, res) => {
    res.status(200).json(await seguimientoService.getMisSeguidosService(req.usuario.id_usuario));
});

export const seguirResidente = manejar("seguirResidente", "Error interno al seguir al residente", async (req, res) => {
    const { error, value } = ResidenteParamValidation.validate(req.params);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const resultado = await seguimientoService.seguirResidenteService(req.usuario.id_usuario, value.id_residente);
    res.status(201).json({ message: "Ahora sigues a este residente", ...resultado });
});

export const dejarDeSeguirResidente = manejar(
    "dejarDeSeguirResidente",
    "Error interno al dejar de seguir al residente",
    async (req, res) => {
        const { error, value } = ResidenteParamValidation.validate(req.params);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const resultado = await seguimientoService.dejarDeSeguirResidenteService(req.usuario.id_usuario, value.id_residente);
        res.status(200).json({ message: "Dejaste de seguir a este residente", ...resultado });
    }
);