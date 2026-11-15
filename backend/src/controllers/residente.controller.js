"use strict";
import * as residenteService from "../services/residente.services.js";

const esStaff = (req) => ["Fundador/a", "Admin"].includes(req.usuario?.rol);

export const getResidentes = async (req, res) => {
    try {
        const resultado = await residenteService.getResidentesService(req.query, { esStaff: esStaff(req) });
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error en getResidentes:", error);
        res.status(500).json({ message: "Error interno al obtener los residentes" });
    }
};

export const getResidente = async (req, res) => {
    try {
        const residente = await residenteService.getResidenteService(req.params.id_residente, {
            esStaff: esStaff(req),
        });
        res.status(200).json(residente);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getResidente:", error);
        res.status(500).json({ message: "Error interno al obtener el residente" });
    }
};

export const updateResidente = async (req, res) => {
    try {
        const residente = await residenteService.updateResidenteService(req.params.id_residente, req.body);
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
