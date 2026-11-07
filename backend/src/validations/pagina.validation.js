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
    bloques: Joi.array()
        .items(Joi.alternatives().try(bloqueTexto, bloqueImagen, bloqueGaleria, bloqueSeparador, bloqueRedes))
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