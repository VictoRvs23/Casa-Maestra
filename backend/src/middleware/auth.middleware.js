"use strict";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/configEnv.js";

export function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        
        if (!authHeader) {
            return res.status(401).json({ message: "No se entregó un token de acceso" });
        }
        
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.usuario = {
            id_usuario: decoded.id_usuario,
            email: decoded.email,   
            rol: decoded.rol, 
            nombre: decoded.nombre,
        };
        
        return next();
    } catch (error) {
        return res.status(403).json({ 
            error: "Token inválido o expirado", 
            details: error.message 
        });
    }
}

export const authorizeRoles = (...roles_permitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !roles_permitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ 
                message: `Acceso denegado: Esta acción requiere rol de ${roles_permitidos.join(" o ")}.` 
            });
        }
        return next();
    };
};