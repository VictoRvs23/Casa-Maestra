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
    id_usuario: Joi.number()
        .integer()
        .positive()
        .allow("", null)
        .messages({
            "number.base": "La cuenta seleccionada no es válida.",
            "number.integer": "La cuenta seleccionada no es válida.",
            "number.positive": "La cuenta seleccionada no es válida.",
        }),
}).unknown(false);

export const ActualizarResidenteValidation = CrearResidenteValidation.fork(
    ["nombre"],
    (schema) => schema.optional()
);
