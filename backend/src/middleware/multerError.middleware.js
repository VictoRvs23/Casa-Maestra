"use strict";

export const handleMulterError = (err, req, res, next) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "La imagen no puede superar los 5 MB." });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Campo de archivo inesperado. Usa el campo 'imagen'." });
    }

    return res.status(400).json({ message: err.message || "Error al subir el archivo." });
};