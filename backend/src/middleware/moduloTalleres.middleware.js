"use strict";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/configEnv.js";
import { getTalleresHabilitadoService } from "../services/switchModulo.services.js";

const MENSAJE = "El módulo de Talleres no está disponible por ahora.";

const esStaff = (req) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return false;
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const { rol } = jwt.verify(token, JWT_SECRET);
        return rol === "Admin" || rol === "Fundador/a";
    } catch {
        return false;
    }
};

const crearBloqueo = (debeBloquear) => async (req, res, next) => {
    try {
        if (!debeBloquear(req) || (await getTalleresHabilitadoService()) || esStaff(req)) return next();
        return res.status(403).json({ message: MENSAJE, modulo_deshabilitado: true });
    } catch (error) {
        console.error("Error al revisar el módulo de Talleres:", error);
        return next();
    }
};

export const bloquearSiTalleresDeshabilitado = crearBloqueo(() => true);

export const bloquearNuevosArriendos = crearBloqueo(
    (req) => req.method === "POST" || req.path.startsWith("/disponibilidad")
);
