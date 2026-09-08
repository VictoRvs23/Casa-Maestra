"use strict";
import { Router } from "express";
import { getUsuario,
    getUsuarios,
    updateUsuario,
    deleteUsuario 
} from "../controllers/usuario.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

const accesosPermitidos = authorizeRoles("Admin", "Fundador/a");

const canEditarPerfil = (req, res, next) => {
    const idFromUrl = req.params.id_usuario;
    const usuarioRol = req.usuario.rol;
    const idFromToken = req.usuario.id_usuario;

    if (usuarioRol === "Admin" || usuarioRol === "Fundador/a" || String(idFromToken) === String(idFromUrl)) {
        return next();
    }
    return res.status(403).json({ message: "No tienes permiso para editar este perfil." });
};

router.get("/", verifyToken, accesosPermitidos, getUsuarios);
router.get("/:id_usuario", verifyToken, accesosPermitidos, getUsuario);
router.put("/:id_usuario", verifyToken, canEditarPerfil, updateUsuario);
router.delete("/:id_usuario", verifyToken, accesosPermitidos, deleteUsuario);

export default router;