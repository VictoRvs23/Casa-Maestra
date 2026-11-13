"use strict";
import { Router } from "express";
import {
    eliminarNotificacion,
    getContador,
    getMisNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
} from "../controllers/notificacion.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.get("/", getMisNotificaciones);
router.get("/contador", getContador);

router.patch("/leidas", marcarTodasLeidas);
router.patch("/:id_notificacion/leida", marcarLeida);
router.delete("/:id_notificacion", eliminarNotificacion);

export default router;