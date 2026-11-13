import Joi from "joi";
import { FUENTES_PAGINA, MAX_BLOQUES, MAX_FOTOS_GALERIA } from "../config/paginaEstilos.js";

const color = Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .messages({
        "string.pattern.base": "El color debe tener el formato #RRGGBB.",
    });

const urlImagen = Joi.string()
    .max(255)
    .pattern(/^\/uploads\/paginas\/[\w.-]+$/)
    .messages({
        "string.pattern.base": "Una de las imágenes no es válida.",
    });

const tamano = Joi.string().valid("pequeno", "mediano", "grande").default("grande");

const id = Joi.string().pattern(/^[\w-]{1,40}$/).required();

const bloqueTexto = Joi.object({
    id,
    tipo: Joi.string().valid("texto").required(),
    contenido: Joi.string().trim().allow("").max(1500).required(),
}).unknown(false);

const bloqueImagen = Joi.object({
    id,
    tipo: Joi.string().valid("imagen").required(),
    url: urlImagen.allow(null, "").required(),
    alt: Joi.string().trim().allow("").max(120).default(""),
    tamano,
}).unknown(false);

const bloqueGaleria = Joi.object({
    id,
    tipo: Joi.string().valid("galeria").required(),
    imagenes: Joi.array().items(urlImagen.allow(null)).max(MAX_FOTOS_GALERIA).required(),
}).unknown(false);

const bloqueSeparador = Joi.object({
    id,
    tipo: Joi.string().valid("separador").required(),
}).unknown(false);

const esEnlaceVideo = (texto) => {
    let url;
    try {
        url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
    } catch {
        return false;
    }
    if (!["http:", "https:"].includes(url.protocol)) return false;

    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    const partes = url.pathname.split("/").filter(Boolean);

    switch (host) {
        case "youtu.be":
            return /^[\w-]{11}$/.test(partes[0] || "");
        case "youtube.com": {
            const id = partes[0] === "watch" ? url.searchParams.get("v") : ["shorts", "embed"].includes(partes[0]) ? partes[1] : null;
            return /^[\w-]{11}$/.test(id || "");
        }
        case "vimeo.com":
        case "player.vimeo.com":
            return partes.some((p) => /^\d+$/.test(p));
        case "instagram.com": {
            const i = partes.findIndex((p) => ["p", "reel", "tv"].includes(p));
            return i >= 0 && /^[\w-]{5,30}$/.test(partes[i + 1] || "");
        }
        case "tiktok.com": {
            const i = partes.indexOf("video");
            return i >= 0 && /^\d{10,25}$/.test(partes[i + 1] || "");
        }
        default:
            return false;
    }
};

const enlaceVideo = Joi.string()
    .trim()
    .allow("")
    .max(300)
    .custom((valor, helpers) => (!valor || esEnlaceVideo(valor) ? valor : helpers.error("video.invalido")))
    .messages({
        "video.invalido": "El video debe ser un enlace de YouTube, Vimeo, Instagram o TikTok (TikTok con el enlace largo).",
    });

const bloqueVideo = Joi.object({
    id,
    tipo: Joi.string().valid("video").required(),
    url: enlaceVideo.required(),
    tamano,
}).unknown(false);

const bloqueRedes = Joi.object({
    id,
    tipo: Joi.string().valid("redes").required(),
    instagram: Joi.string().trim().allow("").max(30).pattern(/^@?[\w.]*$/).default(""),
    tiktok: Joi.string().trim().allow("").max(30).pattern(/^@?[\w.]*$/).default(""),
    facebook: Joi.string().trim().allow("").max(50).pattern(/^@?[\w.-]*$/).default(""),
    youtube: Joi.string().trim().allow("").max(40).pattern(/^@?[\w.-]*$/).default(""),
    whatsapp: Joi.string().trim().allow("").max(20).pattern(/^\+?[\d\s-]{8,20}$/).default(""),
    email: Joi.string().trim().allow("").email({ tlds: { allow: false } }).max(200).default(""),
}).unknown(false);

export const ActualizarPaginaValidation = Joi.object({
    publicada: Joi.boolean(),
    color_acento: color,
    color_fondo: color,
    fuente: Joi.string().valid(...FUENTES_PAGINA).messages({
        "any.only": "La fuente elegida no es válida.",
    }),
    portada: urlImagen.allow(null),
    foto: urlImagen.allow(null),
    bloques: Joi.array()
        .items(Joi.alternatives().try(bloqueTexto, bloqueImagen, bloqueGaleria, bloqueSeparador, bloqueRedes, bloqueVideo))
        .max(MAX_BLOQUES)
        .unique("id")
        .messages({
            "array.max": `Puedes agregar hasta ${MAX_BLOQUES} bloques.`,
            "array.unique": "Hay bloques repetidos.",
            "alternatives.match": "Uno de los bloques tiene datos inválidos.",
            "array.includes": "Uno de los bloques tiene datos inválidos.",
        }),
})
    .min(1)
    .unknown(false)
    .messages({
        "object.min": "No se envió ningún cambio.",
    });