"use strict";
import { Router } from "express";
import { getAgenda, actualizarAgenda } from "../controllers/agenda.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router({ mergeParams: true });

const puedeGestionarEstudios = authorizeRoles("Fundador/a", "Admin");

router.get("/", getAgenda);

router.put("/", verifyToken, puedeGestionarEstudios, actualizarAgenda);

export default router;