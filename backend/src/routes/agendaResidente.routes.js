"use strict";
import { Router } from "express";
import {
    getMisServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    getMisHorarios,
    guardarMisHorarios,
    getOfertaPublica,
} from "../controllers/agendaResidente.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { uploadImagenServicio } from "../upload/servicio.upload.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { ServicioValidation, HorariosValidation } from "../validations/agendaResidente.validation.js";

const router = Router();

router.get("/publico/:slug", getOfertaPublica);
 
router.use(verifyToken, authorizeRoles("Residente"));

router.get("/servicios", getMisServicios);
router.post("/servicios", uploadImagenServicio.single("imagen"), handleMulterError, validateBody(ServicioValidation), crearServicio);
router.put("/servicios/:id_servicio", uploadImagenServicio.single("imagen"), handleMulterError, validateBody(ServicioValidation), actualizarServicio);
router.delete("/servicios/:id_servicio", eliminarServicio);

router.get("/horarios", getMisHorarios);
router.put("/horarios", validateBody(HorariosValidation), guardarMisHorarios);

export default router;
