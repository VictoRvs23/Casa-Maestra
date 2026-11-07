"use strict";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve("uploads/paginas");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const EXTENSIONES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const nombreUnico = `pagina-${req.usuario.id_usuario}-${Date.now()}-${Math.round(Math.random() * 1e6)}${EXTENSIONES[file.mimetype]}`;
        cb(null, nombreUnico);
    },
});

const fileFilter = (req, file, cb) => {
    if (EXTENSIONES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP."), false);
    }
};

export const uploadImagenPagina = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
