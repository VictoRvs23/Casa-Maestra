"use strict";
import { Router } from "express";
import { getPaginaPublica, registrarVisita } from "../controllers/pagina.controller.js";
import { identificarSiHay } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:slug", getPaginaPublica);
router.post("/:slug/visita", identificarSiHay, registrarVisita);

export default router;