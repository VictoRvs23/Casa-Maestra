"use strict";
import { Router } from "express";
import { getSwitches, updateTalleres } from "../controllers/switchModulo.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getSwitches);

router.put("/talleres", verifyToken, authorizeRoles("Fundador/a", "Admin"), updateTalleres);

export default router;
