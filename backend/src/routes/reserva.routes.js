"use strict";
import { Router } from "express";
import { cancelarReserva, getMisReservas, getReservas } from "../controllers/reserva.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router();

router.get("/", verifyToken, authorizeRoles("Fundador/a", "Admin"), getReservas);
router.get("/mias", verifyToken, getMisReservas);
router.delete("/:id_reserva", verifyToken, cancelarReserva);

export default router;