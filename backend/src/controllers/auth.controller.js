"use strict";
import * as authService from "../services/auth.services.js";

export async function login(req, res) {
  try {
    const { token, usuario } = await authService.loginService(req.body);
    res.status(200).json({ message: "Inicio de sesión exitoso", token, usuario});

  } catch (error) {

    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Error en el login:", error);

    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Error en el servidor" });
  }
}

export async function registro(req, res) {
  try {
    const { token, usuario } = await authService.registroService(req.body);
    res.status(200).json({ message: "Registro exitoso", token, usuario});

  } catch (error) {

    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Error en el registro:", error);

    const status = error.status || 500;
    res.status(status).json({ message: error.message || "Error en el servidor" });
  }
}