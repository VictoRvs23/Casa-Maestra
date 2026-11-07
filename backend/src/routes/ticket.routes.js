"use strict";
import { Router } from "express";
import {
    createTicket,
    getMisTickets,
    getTickets,
    updateTicket,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { CrearTicketValidation, ActualizarTicketValidation } from "../validations/ticket.validation.js";

const router = Router();

const puedeGestionarTickets = authorizeRoles("Fundador/a", "Admin");

router.post("/", verifyToken, validateBody(CrearTicketValidation), createTicket);

router.get("/mis-tickets", verifyToken, getMisTickets);

router.get("/", verifyToken, puedeGestionarTickets, getTickets);

router.put("/:id_ticket", verifyToken, puedeGestionarTickets, validateBody(ActualizarTicketValidation), updateTicket);

export default router;