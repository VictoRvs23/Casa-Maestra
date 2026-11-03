"use strict";
import * as reservaService from "../services/reserva.services.js";
import { CrearReservaValidation, DisponibilidadQueryValidation } from "../validations/reserva.validation.js";

export const getEstudio0 = async (req, res) => {
    try {
        const estudio = await reservaService.getEstudio0Service();
        res.status(200).json(estudio);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getEstudio0:", error);
        res.status(500).json({ message: "Error interno al obtener el Estudio 0" });
    }
};

export const getDisponibilidad = async (req, res) => {
    try {
        const { error, value } = DisponibilidadQueryValidation.validate({ mes: req.query.mes });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const disponibilidad = await reservaService.getDisponibilidadService(value.mes);
        res.status(200).json(disponibilidad);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getDisponibilidad:", error);
        res.status(500).json({ message: "Error interno al obtener la disponibilidad" });
    }
};

export const crearReserva = async (req, res) => {
    try {
        const { error, value } = CrearReservaValidation.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const reserva = await reservaService.crearReservaService(req.usuario.id_usuario, value);
        res.status(201).json({ message: "Reserva confirmada", reserva });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en crearReserva:", error);
        res.status(500).json({ message: "Error interno al crear la reserva" });
    }
};

export const cancelarReserva = async (req, res) => {
    try {
        await reservaService.cancelarReservaService(req.params.id_reserva, req.usuario.id_usuario, req.usuario.rol);
        res.status(200).json({ message: "Reserva cancelada" });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en cancelarReserva:", error);
        res.status(500).json({ message: "Error interno al cancelar la reserva" });
    }
};

export const getMisReservas = async (req, res) => {
    try {
        const reservas = await reservaService.getMisReservasService(req.usuario.id_usuario);
        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error en getMisReservas:", error);
        res.status(500).json({ message: "Error interno al obtener tus reservas" });
    }
};