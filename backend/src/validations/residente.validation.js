import Joi from "joi";

export const CrearResidenteValidation = Joi.object({
    nombre: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .required()
        .messages({
            "string.empty": "El nombre del residente es obligatorio.",
            "string.min": "El nombre debe tener al menos 2 caracteres.",
            "string.max": "El nombre debe tener máximo 80 caracteres.",
            "any.required": "El nombre del residente es obligatorio.",
        }),
    descripcion: Joi.string()
        .trim()
        .allow("", null)
        .max(150)
        .messages({
            "string.max": "La descripción debe tener máximo 150 caracteres.",
        }),
}).unknown(false);

export const ActualizarResidenteValidation = CrearResidenteValidation.fork(
    ["nombre"],
    (schema) => schema.optional()
);