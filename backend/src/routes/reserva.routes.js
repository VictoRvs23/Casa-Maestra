"use strict";
import { Router } from "express";
import { cancelarReserva, getMisReservas } from "../controllers/reserva.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/mias", verifyToken, getMisReservas);
router.delete("/:id_reserva", verifyToken, cancelarReserva);

export default router;