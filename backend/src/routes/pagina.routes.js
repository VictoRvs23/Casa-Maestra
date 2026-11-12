"use strict";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { getPaginaPublica, registrarVisita } from "../controllers/pagina.controller.js";
import { JWT_SECRET } from "../config/configEnv.js";

const router = Router();

const identificarSiHay = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (authHeader) {
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
            const decoded = jwt.verify(token, JWT_SECRET);
            req.usuario = { id_usuario: decoded.id_usuario };
        }
    } catch {
    }
    next();
};

router.get("/:slug", getPaginaPublica);
router.post("/:slug/visita", identificarSiHay, registrarVisita);

export default router;