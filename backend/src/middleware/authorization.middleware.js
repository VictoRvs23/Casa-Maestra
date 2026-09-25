"use strict";

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