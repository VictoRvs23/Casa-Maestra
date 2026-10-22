"use strict";
import * as ticketService from "../services/ticket.services.js";
import { CATEGORIAS_SOPORTE } from "../config/categoriasSoporte.js";
import { ESTADOS_TICKET } from "../config/estadosTicket.js";

export const createTicket = async (req, res) => {
    try {
        const ticket = await ticketService.createTicketService(req.usuario.id_usuario, req.body);
        res.status(201).json({ message: "Ticket creado", ticket });
    } catch (error) {
        console.error("Error en createTicket:", error);
        res.status(500).json({ message: "Error interno al crear el ticket" });
    }
};

export const getMisTickets = async (req, res) => {
    try {
        const tickets = await ticketService.getMisTicketsService(req.usuario.id_usuario);
        res.status(200).json({ tickets });
    } catch (error) {
        console.error("Error en getMisTickets:", error);
        res.status(500).json({ message: "Error interno al obtener tus tickets" });
    }
};

export const getTickets = async (req, res) => {
    try {
        const { estado, categoria } = req.query;

        if (estado && !ESTADOS_TICKET.includes(estado)) {
            return res.status(400).json({ message: `El estado debe ser uno de: ${ESTADOS_TICKET.join(", ")}.` });
        }
        if (categoria && !CATEGORIAS_SOPORTE.includes(categoria)) {
            return res.status(400).json({ message: `La categoría debe ser una de: ${CATEGORIAS_SOPORTE.join(", ")}.` });
        }

        const resultado = await ticketService.getTicketsService(req.query);
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error en getTickets:", error);
        res.status(500).json({ message: "Error interno al obtener los tickets" });
    }
};

export const updateTicket = async (req, res) => {
    try {
        const ticket = await ticketService.updateTicketService(req.params.id_ticket, req.body);
        res.status(200).json({ message: "Ticket actualizado", ticket });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateTicket:", error);
        res.status(500).json({ message: "Error interno al actualizar el ticket" });
    }
};