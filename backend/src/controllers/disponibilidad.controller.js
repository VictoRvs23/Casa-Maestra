"use strict";
import * as disponibilidadService from "../services/disponibilidad.services.js";
import { SemanaDisponibilidadValidation } from "../validations/disponibilidad.validation.js";

export const getDisponibilidad = async (req, res) => {
    try {
        const bloques = await disponibilidadService.getDisponibilidadService(req.params.id_estudio);
        res.status(200).json(bloques);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getDisponibilidad:", error);
        res.status(500).json({ message: "Error interno al obtener la disponibilidad" });
    }
};

export const actualizarDisponibilidad = async (req, res) => {
    try {
        const { error, value } = SemanaDisponibilidadValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const bloques = await disponibilidadService.reemplazarSemanaService(
            req.params.id_estudio,
            value.bloques
        );
        res.status(200).json({ message: "Disponibilidad actualizada", bloques });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en actualizarDisponibilidad:", error);
        res.status(500).json({ message: "Error interno al actualizar la disponibilidad" });
    }
};