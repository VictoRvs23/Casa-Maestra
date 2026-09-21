"use strict";
import * as usuarioService from "../services/usuario.services.js";

export const getUsuario = async (req, res) => {
    try {

        const usuario = await usuarioService.getUsuarioService(req.params.id_usuario);
        res.status(200).json(usuario);

    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en getUsuario:", error);
        res.status(500).json({ message: "Error interno al obtener usuario" });
    }
};

export const getUsuarios = async (req, res) => {
    try {
        const resultado = await usuarioService.getUsuariosService(req.query);
        res.status(200).json(resultado);

    } catch (error) {

        console.error("Error en getUsuarios:", error);
        res.status(500).json({ message: "Error interno al obtener usuarios" });
    }
};

export const updateUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.updateUsuarioService(req.params.id_usuario, req.body);
        res.status(200).json({ message: "Usuario actualizado", usuario });

    } catch (error) {

        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateUsuario:", error);
        res.status(500).json({ message: "Error interno al actualizar" });
    }
};

export const cambiarContrasena = async (req, res) => {
    try {
        const { contraseña_actual, contraseña_nueva } = req.body;

        if (!contraseña_actual || !contraseña_nueva) {
            return res.status(400).json({ message: "Debes indicar la contraseña actual y la nueva." });
        }
        if (contraseña_nueva.length < 8) {
            return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres." });
        }

        await usuarioService.cambiarContrasenaService(req.params.id_usuario, contraseña_actual, contraseña_nueva);
        res.status(200).json({ message: "Contraseña actualizada correctamente" });

    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en cambiarContrasena:", error);
        res.status(500).json({ message: "Error interno al cambiar la contraseña" });
    }
};

export const subirAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se recibió ninguna imagen." });
        }

        const rutaPublica = `/uploads/avatars/${req.file.filename}`;
        const usuario = await usuarioService.updateUsuarioService(req.params.id_usuario, { avatar: rutaPublica });

        res.status(200).json({ message: "Avatar actualizado", usuario });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en subirAvatar:", error);
        res.status(500).json({ message: "Error interno al subir el avatar" });
    }
};

export const deleteUsuario = async (req, res) => {
    try {
        await usuarioService.deleteUsuarioService(req.params.id_usuario);
        res.status(200).json({ message: "Usuario eliminado" });

    } catch (error) {

        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en deleteUsuario:", error);
        res.status(500).json({ message: "Error interno al eliminar" });
    }
};