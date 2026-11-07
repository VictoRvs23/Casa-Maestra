"use strict";
import { Router } from "express";
import {
    cancelarArriendo,
    crearArriendo,
    getArriendos,
    getDisponibilidadArriendos,
    getMisArriendos,
} from "../controllers/arriendo.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";

const router = Router();

router.get("/disponibilidad", getDisponibilidadArriendos);

router.get("/", verifyToken, authorizeRoles("Fundador/a", "Admin"), getArriendos);
router.get("/mios", verifyToken, getMisArriendos);

router.post("/", verifyToken, crearArriendo);
router.delete("/:id_arriendo", verifyToken, cancelarArriendo);

export default router;