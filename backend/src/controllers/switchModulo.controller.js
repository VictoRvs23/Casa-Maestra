"use strict";
import * as switchModuloService from "../services/switchModulo.services.js";

export const getSwitches = async (req, res) => {
    try {
        res.status(200).json(await switchModuloService.getSwitchesPublicosService());
    } catch (error) {
        console.error("Error en getSwitches:", error);
        res.status(500).json({ message: "Error interno al obtener los interruptores" });
    }
};

export const updateTalleres = async (req, res) => {
    try {
        const { habilitado } = req.body || {};

        if (typeof habilitado !== "boolean") {
            return res.status(400).json({ message: "Indica si el módulo queda habilitado (true) o deshabilitado (false)." });
        }

        const talleres_habilitado = await switchModuloService.setTalleresHabilitadoService(habilitado);
        res.status(200).json({
            message: talleres_habilitado ? "El módulo de Talleres quedó habilitado." : "El módulo de Talleres quedó deshabilitado.",
            talleres_habilitado,
        });
    } catch (error) {
        console.error("Error en updateTalleres:", error);
        res.status(500).json({ message: "Error interno al guardar el interruptor" });
    }
};