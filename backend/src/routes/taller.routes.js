"use strict";
import { Router } from "express";
import {
    getTalleres,
    getTaller,
    getArtistasDisponibles,
    createTaller,
    updateTaller,
    deleteTaller,
} from "../controllers/taller.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { uploadImagenTaller } from "../upload/taller.upload.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { CrearTallerValidation, ActualizarTallerValidation } from "../validations/taller.validation.js";

const router = Router();

const puedeGestionarTalleres = authorizeRoles("Fundador/a", "Admin");

router.get("/", getTalleres);

router.get("/artistas-disponibles", verifyToken, puedeGestionarTalleres, getArtistasDisponibles);

router.get("/:id_taller", getTaller);

router.post(
    "/",
    verifyToken,
    puedeGestionarTalleres,
    uploadImagenTaller.single("imagen"),
    handleMulterError,
    validateBody(CrearTallerValidation),
    createTaller
);
router.put(
    "/:id_taller",
    verifyToken,
    puedeGestionarTalleres,
    uploadImagenTaller.single("imagen"),
    handleMulterError,
    validateBody(ActualizarTallerValidation),
    updateTaller
);
router.delete("/:id_taller", verifyToken, puedeGestionarTalleres, deleteTaller);

export default router;