"use strict";
import { Router } from "express";
import { getUsuario,
    getUsuarios,
    updateUsuario,
    cambiarContrasena,
    subirAvatar,
    deleteUsuario
} from "../controllers/usuario.controller.js";
import { verifyToken} from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorization.middleware.js";
import { uploadAvatar } from "../upload/usuario.upload.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";

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
router.get("/:id_usuario", verifyToken, canEditarPerfil, getUsuario);

router.put("/:id_usuario", verifyToken, canEditarPerfil, updateUsuario);
router.put("/:id_usuario/contrasena", verifyToken, canEditarPerfil, cambiarContrasena);
router.put("/:id_usuario/avatar", verifyToken, canEditarPerfil, uploadAvatar.single("avatar"), handleMulterError, subirAvatar);

router.delete("/:id_usuario", verifyToken, canEditarPerfil, deleteUsuario);

export default router;accesosPermitidos