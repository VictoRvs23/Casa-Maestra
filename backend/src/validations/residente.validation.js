import Joi from "joi";

export const ActualizarResidenteValidation = Joi.object({
    nombre: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .messages({
            "string.empty": "El nombre del residente es obligatorio.",
            "string.min": "El nombre debe tener al menos 2 caracteres.",
            "string.max": "El nombre debe tener máximo 80 caracteres.",
        }),
    descripcion: Joi.string()
        .trim()
        .allow("", null)
        .max(150)
        .messages({
            "string.max": "La descripción debe tener máximo 150 caracteres.",
        }),
    activa: Joi.boolean().messages({
        "boolean.base": "El estado de la tarjeta no es válido.",
    }),
}).unknown(false);
