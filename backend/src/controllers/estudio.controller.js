"use strict";
import * as estudioService from "../services/estudio.services.js";
import {
    CrearEstudioValidation,
    ActualizarEstudioValidation,
} from "../validations/estudio.validation.js";

export const getEstudios = async (req, res) => {
    try {
        const resultado = await estudioService.getEstudiosService(req.query);
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error en getEstudios:", error);
        res.status(500).json({ message: "Error interno al obtener los estudios" });
    }
};

export const getEstudio = async (req, res) => {
    try {
        const estudio = await estudioService.getEstudioService(req.params.id_estudio);
        res.status(200).json(estudio);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getEstudio:", error);
        res.status(500).json({ message: "Error interno al obtener el estudio" });
    }
};

export const createEstudio = async (req, res) => {
    try {
        const { error, value } = CrearEstudioValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const estudio = await estudioService.createEstudioService(value);
        res.status(201).json({ message: "Estudio creado", estudio });
    } catch (error) {
        console.error("Error en createEstudio:", error);
        res.status(500).json({ message: "Error interno al crear el estudio" });
    }
};

export const updateEstudio = async (req, res) => {
    try {
        const { error, value } = ActualizarEstudioValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const estudio = await estudioService.updateEstudioService(req.params.id_estudio, value);
        res.status(200).json({ message: "Estudio actualizado", estudio });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateEstudio:", error);
        res.status(500).json({ message: "Error interno al actualizar el estudio" });
    }
};

export const deleteEstudio = async (req, res) => {
    try {
        await estudioService.deleteEstudioService(req.params.id_estudio);
        res.status(200).json({ message: "Estudio eliminado" });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en deleteEstudio:", error);
        res.status(500).json({ message: "Error interno al eliminar el estudio" });
    }
};