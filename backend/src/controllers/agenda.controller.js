"use strict";
import * as agendaService from "../services/agenda.services.js";
import { SemanaAgendaValidation } from "../validations/agenda.validation.js";
 
export const getAgenda = async (req, res) => {
    try {
        const bloques = await agendaService.getAgendaService(req.params.id_estudio);
        res.status(200).json(bloques);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getAgenda:", error);
        res.status(500).json({ message: "Error interno al obtener la agenda" });
    }
};
 
export const actualizarAgenda = async (req, res) => {
    try {
        const { error, value } = SemanaAgendaValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
 
        const bloques = await agendaService.reemplazarSemanaAgendaService(
            req.params.id_estudio,
            value.bloques
        );
        res.status(200).json({ message: "Agenda actualizada", bloques });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en actualizarAgenda:", error);
        res.status(500).json({ message: "Error interno al actualizar la agenda" });
    }
};