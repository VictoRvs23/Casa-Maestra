"use strict";
import path from "path";
import { HOST, PORT } from "../config/configEnv.js";
import * as  usuarioService  from "../services/usuario.services.js";

export const getUsuario = async (req, res) => {
    try {

        const usuario = await usuarioService.getUsuarioService(req.params.id_usuario);
        res.status(200).json(usuario);

    } catch (error) {

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
        await usuarioService.updateUsuarioService(req.params.id_usuario, req.body);
        res.status(200).json({ message: "Usuario actualizado" });

    } catch (error) {

        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Error en updateUsuario:", error);
        res.status(500).json({ message: "Error interno al actualizar" });
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