"use strict";
import * as preguntaService from "../services/preguntaFrecuente.services.js";
import { CATEGORIAS_SOPORTE } from "../config/categoriasSoporte.js";

export const getPreguntas = async (req, res) => {
    try {
        const { categoria } = req.query;

        if (categoria && !CATEGORIAS_SOPORTE.includes(categoria)) {
            return res.status(400).json({
                message: `La categoría debe ser una de: ${CATEGORIAS_SOPORTE.join(", ")}.`,
            });
        }

        const preguntas = await preguntaService.getPreguntasService({ categoria });
        res.status(200).json(preguntas);
    } catch (error) {
        console.error("Error en getPreguntas:", error);
        res.status(500).json({ message: "Error interno al obtener las preguntas frecuentes" });
    }
};

export const getPregunta = async (req, res) => {
    try {
        const pregunta = await preguntaService.getPreguntaService(req.params.id_pregunta);
        res.status(200).json(pregunta);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getPregunta:", error);
        res.status(500).json({ message: "Error interno al obtener la pregunta frecuente" });
    }
};

export const createPregunta = async (req, res) => {
    try {
        const pregunta = await preguntaService.createPreguntaService(req.body);

        if (!pregunta || !pregunta.id_pregunta) {
            return res.status(500).json({ message: "La pregunta no se pudo guardar correctamente." });
        }

        res.status(201).json({ message: "Pregunta frecuente creada", pregunta });
    } catch (error) {
        console.error("Error en createPregunta:", error);
        res.status(500).json({ message: "Error interno al crear la pregunta frecuente" });
    }
};

export const updatePregunta = async (req, res) => {
    try {
        const pregunta = await preguntaService.updatePreguntaService(req.params.id_pregunta, req.body);

        if (!pregunta || !pregunta.id_pregunta) {
            return res.status(500).json({ message: "Los cambios no se pudieron guardar correctamente." });
        }

        res.status(200).json({ message: "Pregunta frecuente actualizada", pregunta });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updatePregunta:", error);
        res.status(500).json({ message: "Error interno al actualizar la pregunta frecuente" });
    }
};

export const deletePregunta = async (req, res) => {
    try {
        await preguntaService.deletePreguntaService(req.params.id_pregunta);
        res.status(200).json({ message: "Pregunta frecuente eliminada" });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en deletePregunta:", error);
        res.status(500).json({ message: "Error interno al eliminar la pregunta frecuente" });
    }
};