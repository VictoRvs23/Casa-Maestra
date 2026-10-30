"use strict";
import * as paginaService from "../services/pagina.services.js";
import { PREFIJO_URL_PAGINA } from "../config/paginaEstilos.js";

export const getMiPagina = async (req, res) => {
    try {
        const resultado = await paginaService.getMiPaginaService(req.usuario.id_usuario);
        res.status(200).json(resultado);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getMiPagina:", error);
        res.status(500).json({ message: "Error interno al obtener tu página" });
    }
};

export const updateMiPagina = async (req, res) => {
    try {
        const pagina = await paginaService.updateMiPaginaService(req.usuario.id_usuario, req.body);
        res.status(200).json({ message: "Página actualizada", pagina });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateMiPagina:", error);
        res.status(500).json({ message: "Error interno al guardar tu página" });
    }
};

export const subirImagenPagina = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se recibió ninguna imagen." });
    }
    res.status(201).json({ url: `${PREFIJO_URL_PAGINA}${req.file.filename}` });
};

export const getPaginaPublica = async (req, res) => {
    try {
        const resultado = await paginaService.getPaginaPublicaService(req.params.slug);
        res.status(200).json(resultado);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getPaginaPublica:", error);
        res.status(500).json({ message: "Error interno al obtener la página" });
    }
};
