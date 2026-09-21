"use strict";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve("uploads/avatars");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombreUnico = `avatar-${req.params.id_usuario}-${Date.now()}${ext}`;
        cb(null, nombreUnico);
    },
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP."), false);
    }
};

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 },
});