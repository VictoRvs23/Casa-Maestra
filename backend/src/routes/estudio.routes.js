"use strict";
import { Router } from "express";
import {
    getEstudio,
    getEstudios,
    createEstudio,
    updateEstudio,
    deleteEstudio,
} from "../controllers/estudio.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

const GestionEstudios = authorizeRoles("Fundador/a", "Admin");

router.get("/", getEstudios);
router.get("/:id_estudio", getEstudio);

router.post("/", verifyToken, GestionEstudios, createEstudio);
router.put("/:id_estudio", verifyToken, GestionEstudios, updateEstudio);
router.delete("/:id_estudio", verifyToken, GestionEstudios, deleteEstudio);

export default router;