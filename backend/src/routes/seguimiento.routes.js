"use strict";
import { Router } from "express";
import {
    dejarDeSeguirResidente,
    getMisSeguidos,
    getResumenSeguidores,
    seguirResidente,
} from "../controllers/seguimiento.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/residente/:slug", getResumenSeguidores);

router.get("/", verifyToken, getMisSeguidos);

router.post("/:id_residente", verifyToken, seguirResidente);
router.delete("/:id_residente", verifyToken, dejarDeSeguirResidente);

export default router;