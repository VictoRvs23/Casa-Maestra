"use strict";
import { Router } from "express";
import { getMiPagina, updateMiPagina, subirImagenPagina } from "../controllers/pagina.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { uploadImagenPagina } from "../upload/pagina.upload.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { ActualizarPaginaValidation } from "../validations/pagina.validation.js";

const router = Router();

router.use(verifyToken, authorizeRoles("Residente"));

router.get("/", getMiPagina);
router.put("/", validateBody(ActualizarPaginaValidation), updateMiPagina);

router.post("/imagenes", uploadImagenPagina.single("imagen"), handleMulterError, subirImagenPagina);

export default router;
