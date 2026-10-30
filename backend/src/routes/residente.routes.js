"use strict";
import { Router } from "express";
import {
    getResidentes,
    getResidente,
    getCuentasDisponibles,
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

const puedeGestionarResidentes = authorizeRoles("Fundador/a", "Admin");

router.get("/", getResidentes);

router.get("/cuentas-disponibles", verifyToken, puedeGestionarResidentes, getCuentasDisponibles);

router.get("/:id_residente", getResidente);

router.post(
    "/", verifyToken, puedeGestionarResidentes, uploadImagenResidente.single("imagen"), handleMulterError, validateBody(CrearResidenteValidation), createResidente
);
router.put(
    "/:id_residente", verifyToken, puedeGestionarResidentes, uploadImagenResidente.single("imagen"), handleMulterError, validateBody(ActualizarResidenteValidation), updateResidente
);
router.delete("/:id_residente", verifyToken, puedeGestionarResidentes, deleteResidente);

export default router;
