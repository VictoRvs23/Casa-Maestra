'use strict';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const envFilePath = path.resolve(_dirname, '../../.env');
const result = dotenv.config({ path: envFilePath });

if (result.error) {
    console.error("No se pudo cargar el archivo .env:", result.error);
} else {
    console.log("Archivo .env cargado correctamente");
}

export const HOST = process.env.HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DATABASE = process.env.DATABASE;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3000;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;


console.log("Configuración cargada para:", {
    usuario: DB_USERNAME,
    baseDatos: DATABASE
});