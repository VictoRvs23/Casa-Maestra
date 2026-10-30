"use strict";
import { Router } from "express";
import { getPaginaPublica } from "../controllers/pagina.controller.js";

const router = Router();

router.get("/:slug", getPaginaPublica);

export default router;
