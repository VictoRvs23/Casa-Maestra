import Joi from "joi";

export const CrearTallerValidation = Joi.object({
    nombre: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .required()
        .messages({
            "string.empty": "El nombre del taller es obligatorio.",
            "string.min": "El nombre debe tener al menos 2 caracteres.",
            "string.max": "El nombre debe tener máximo 80 caracteres.",
            "any.required": "El nombre del taller es obligatorio.",
        }),
    descripcion: Joi.string()
        .trim()
        .allow("", null)
        .max(1500)
        .messages({
            "string.max": "La descripción debe tener máximo 1500 caracteres.",
        }),
    artistas: Joi.string()
        .trim()
        .allow("")
        .pattern(/^\d+(,\d+)*$/)
        .messages({
            "string.pattern.base": "La lista de artistas no es válida.",
        }),
}).unknown(false);

export const ActualizarTallerValidation = CrearTallerValidation.fork(
    ["nombre"],
    (schema) => schema.optional()
);