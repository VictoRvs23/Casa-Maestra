"use strict";
import { Router } from "express";
import { getDisponibilidad, actualizarDisponibilidad } from "../controllers/disponibilidad.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

const puedeGestionarEstudios = authorizeRoles("Fundador/a", "Admin");

router.get("/", getDisponibilidad);

router.put("/", verifyToken, puedeGestionarEstudios, actualizarDisponibilidad);

export default router;