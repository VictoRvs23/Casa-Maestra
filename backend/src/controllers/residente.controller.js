"use strict";
import * as residenteService from "../services/residente.services.js";

export const getResidentes = async (req, res) => {
    try {
        const resultado = await residenteService.getResidentesService(req.query);
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error en getResidentes:", error);
        res.status(500).json({ message: "Error interno al obtener los residentes" });
    }
};

export const getResidente = async (req, res) => {
    try {
        const residente = await residenteService.getResidenteService(req.params.id_residente);
        res.status(200).json(residente);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getResidente:", error);
        res.status(500).json({ message: "Error interno al obtener el residente" });
    }
};

export const createResidente = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.imagen = `/uploads/residentes/${req.file.filename}`;
        }

        const residente = await residenteService.createResidenteService(data);

        if (!residente || !residente.id_residente) {
            return res.status(500).json({ message: "El residente no se pudo guardar correctamente." });
        }

        res.status(201).json({ message: "Residente creado", residente });
    } catch (error) {
        console.error("Error en createResidente:", error);
        res.status(500).json({ message: "Error interno al crear el residente" });
    }
};

export const updateResidente = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.imagen = `/uploads/residentes/${req.file.filename}`;
        }

        const residente = await residenteService.updateResidenteService(req.params.id_residente, data);

        if (!residente || !residente.id_residente) {
            return res.status(500).json({ message: "Los cambios no se pudieron guardar correctamente." });
        }

        res.status(200).json({ message: "Residente actualizado", residente });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateResidente:", error);
        res.status(500).json({ message: "Error interno al actualizar el residente" });
    }
};

export const deleteResidente = async (req, res) => {
    try {
        await residenteService.deleteResidenteService(req.params.id_residente);
        res.status(200).json({ message: "Residente eliminado" });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en deleteResidente:", error);
        res.status(500).json({ message: "Error interno al eliminar el residente" });
    }
};