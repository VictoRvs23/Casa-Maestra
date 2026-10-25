"use strict";
import { Router } from "express";
import {
    getPreguntas,
    getPregunta,
    createPregunta,
    updatePregunta,
    deletePregunta,
} from "../controllers/preguntaFrecuente.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { CrearPreguntaValidation, ActualizarPreguntaValidation } from "../validations/preguntaFrecuente.validation.js";

const router = Router();

const puedeGestionarSoporte = authorizeRoles("Fundador/a", "Admin");

router.get("/", getPreguntas);
router.get("/:id_pregunta", getPregunta);

router.post("/", verifyToken, puedeGestionarSoporte, validateBody(CrearPreguntaValidation), createPregunta);
router.put("/:id_pregunta", verifyToken, puedeGestionarSoporte, validateBody(ActualizarPreguntaValidation), updatePregunta);
router.delete("/:id_pregunta", verifyToken, puedeGestionarSoporte, deletePregunta);

export default router;