"use strict";
import { Router } from "express";
import { getResidentes, getResidente, updateResidente, deleteResidente } from "../controllers/residente.controller.js";
import { verifyToken, identificarSiHay } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { ActualizarResidenteValidation } from "../validations/residente.validation.js";

const router = Router();

const puedeGestionarResidentes = authorizeRoles("Fundador/a", "Admin");

router.get("/", identificarSiHay, getResidentes);
router.get("/:id_residente", identificarSiHay, getResidente);

router.put(
    "/:id_residente", verifyToken, puedeGestionarResidentes, validateBody(ActualizarResidenteValidation), updateResidente
);
router.delete("/:id_residente", verifyToken, puedeGestionarResidentes, deleteResidente);

export default router;