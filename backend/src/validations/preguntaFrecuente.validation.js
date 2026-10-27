import Joi from "joi";
import { CATEGORIAS_SOPORTE } from "../config/categoriasSoporte.js";

export const CrearPreguntaValidation = Joi.object({
    pregunta: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
            "string.empty": "La pregunta es obligatoria.",
            "string.min": "La pregunta debe tener al menos 5 caracteres.",
            "string.max": "La pregunta debe tener máximo 200 caracteres.",
            "any.required": "La pregunta es obligatoria.",
        }),
    respuesta: Joi.string()
        .trim()
        .min(5)
        .max(2000)
        .required()
        .messages({
            "string.empty": "La respuesta es obligatoria.",
            "string.min": "La respuesta debe tener al menos 5 caracteres.",
            "string.max": "La respuesta debe tener máximo 2000 caracteres.",
            "any.required": "La respuesta es obligatoria.",
        }),
    categoria: Joi.string()
        .valid(...CATEGORIAS_SOPORTE)
        .required()
        .messages({
            "any.only": `La categoría debe ser una de: ${CATEGORIAS_SOPORTE.join(", ")}.`,
            "any.required": "La categoría es obligatoria.",
        }),
    orden: Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base": "El orden debe ser un número.",
            "number.integer": "El orden debe ser un número entero.",
            "number.min": "El orden no puede ser negativo.",
        }),
}).unknown(false);

export const ActualizarPreguntaValidation = CrearPreguntaValidation.fork(
    ["pregunta", "respuesta", "categoria"],
    (schema) => schema.optional()
);