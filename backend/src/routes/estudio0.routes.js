"use strict";
import { Router } from "express";
import { getEstudio0, getDisponibilidad, crearReserva } from "../controllers/reserva.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getEstudio0);
router.get("/disponibilidad", getDisponibilidad);

router.post("/reservas", verifyToken, crearReserva);

export default router;