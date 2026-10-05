"use strict";
import { Router } from "express";
import {
    getResidentes,
    getResidente,
    createResidente,
    updateResidente,
    deleteResidente,
} from "../controllers/residente.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { uploadImagenResidente } from "../upload/residente.upload.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { CrearResidenteValidation, ActualizarResidenteValidation } from "../validations/residente.validation.js";

const router = Router();

const GestionResidentes = authorizeRoles("Fundador/a", "Admin");

router.get("/", getResidentes);
router.get("/:id_residente", getResidente);

router.post("/", verifyToken, GestionResidentes, uploadImagenResidente.single("imagen"), handleMulterError, validateBody(CrearResidenteValidation), createResidente);
router.put("/:id_residente", verifyToken, GestionResidentes, uploadImagenResidente.single("imagen"), handleMulterError, validateBody(ActualizarResidenteValidation), updateResidente);
router.delete("/:id_residente", verifyToken, GestionResidentes, deleteResidente);

export default router;