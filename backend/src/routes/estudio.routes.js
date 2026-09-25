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
import { uploadImagenEstudio } from "../upload/estudio.upload.js";
import { validateBody } from "../middleware/validateBody.js";
import { CrearEstudioValidation, ActualizarEstudioValidation } from "../validations/estudio.validation.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";
import agendaRoutes from "./agenda.routes.js";

const router = Router();

const GestionEstudios = authorizeRoles("Fundador/a", "Admin");

router.get("/", getEstudios);
router.get("/:id_estudio", getEstudio);

router.post("/", verifyToken, GestionEstudios, uploadImagenEstudio.single("imagen"),handleMulterError, validateBody(CrearEstudioValidation), createEstudio);
router.put("/:id_estudio", verifyToken, GestionEstudios, uploadImagenEstudio.single("imagen"), handleMulterError, validateBody(ActualizarEstudioValidation), updateEstudio);
router.delete("/:id_estudio", verifyToken, GestionEstudios, deleteEstudio);

router.use("/:id_estudio/agenda", agendaRoutes);

export default router;