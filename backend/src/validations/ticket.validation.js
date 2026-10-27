import Joi from "joi";
import { CATEGORIAS_SOPORTE } from "../config/categoriasSoporte.js";
import { ESTADOS_TICKET } from "../config/estadosTicket.js";

export const CrearTicketValidation = Joi.object({
    asunto: Joi.string()
        .trim()
        .min(5)
        .max(120)
        .required()
        .messages({
            "string.empty": "El asunto es obligatorio.",
            "string.min": "El asunto debe tener al menos 5 caracteres.",
            "string.max": "El asunto debe tener máximo 120 caracteres.",
            "any.required": "El asunto es obligatorio.",
        }),
    mensaje: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            "string.empty": "El mensaje es obligatorio.",
            "string.min": "El mensaje debe tener al menos 10 caracteres.",
            "string.max": "El mensaje debe tener máximo 2000 caracteres.",
            "any.required": "El mensaje es obligatorio.",
        }),
    categoria: Joi.string()
        .valid(...CATEGORIAS_SOPORTE)
        .required()
        .messages({
            "any.only": `La categoría debe ser una de: ${CATEGORIAS_SOPORTE.join(", ")}.`,
            "any.required": "La categoría es obligatoria.",
        }),
}).unknown(false);

export const ActualizarTicketValidation = Joi.object({
    estado: Joi.string()
        .valid(...ESTADOS_TICKET)
        .messages({
            "any.only": `El estado debe ser uno de: ${ESTADOS_TICKET.join(", ")}.`,
        }),
    respuesta: Joi.string()
        .trim()
        .allow("")
        .max(2000)
        .messages({
            "string.max": "La respuesta debe tener máximo 2000 caracteres.",
        }),
})
    .or("estado", "respuesta")
    .unknown(false)
    .messages({
        "object.missing": "Debes indicar un estado o una respuesta.",
    });