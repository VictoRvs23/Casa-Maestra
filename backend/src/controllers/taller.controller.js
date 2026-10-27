"use strict";
import * as tallerService from "../services/taller.services.js";

const parseArtistas = (valor) => {
    if (valor === undefined) return undefined;
    if (valor === "") return [];
    return [...new Set(valor.split(",").map(Number))];
};

export const getTalleres = async (req, res) => {
    try {
        const talleres = await tallerService.getTalleresService();
        res.status(200).json({ talleres });
    } catch (error) {
        console.error("Error en getTalleres:", error);
        res.status(500).json({ message: "Error interno al obtener los talleres" });
    }
};

export const getTaller = async (req, res) => {
    try {
        const taller = await tallerService.getTallerService(req.params.id_taller);
        res.status(200).json(taller);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getTaller:", error);
        res.status(500).json({ message: "Error interno al obtener el taller" });
    }
};

export const getArtistasDisponibles = async (req, res) => {
    try {
        const artistas = await tallerService.getArtistasDisponiblesService();
        res.status(200).json({ artistas });
    } catch (error) {
        console.error("Error en getArtistasDisponibles:", error);
        res.status(500).json({ message: "Error interno al obtener los artistas" });
    }
};

export const createTaller = async (req, res) => {
    try {
        const data = { ...req.body };
        data.artistas = parseArtistas(data.artistas);

        if (req.file) {
            data.imagen = `/uploads/talleres/${req.file.filename}`;
        }

        const taller = await tallerService.createTallerService(data);
        res.status(201).json({ message: "Taller creado", taller });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en createTaller:", error);
        res.status(500).json({ message: "Error interno al crear el taller" });
    }
};

export const updateTaller = async (req, res) => {
    try {
        const data = { ...req.body };
        data.artistas = parseArtistas(data.artistas);

        if (req.file) {
            data.imagen = `/uploads/talleres/${req.file.filename}`;
        }

        const taller = await tallerService.updateTallerService(req.params.id_taller, data);
        res.status(200).json({ message: "Taller actualizado", taller });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateTaller:", error);
        res.status(500).json({ message: "Error interno al actualizar el taller" });
    }
};

export const deleteTaller = async (req, res) => {
    try {
        await tallerService.deleteTallerService(req.params.id_taller);
        res.status(200).json({ message: "Taller eliminado" });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en deleteTaller:", error);
        res.status(500).json({ message: "Error interno al eliminar el taller" });
    }
};