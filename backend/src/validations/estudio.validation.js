import Joi from "joi";

export const CrearEstudioValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "El nombre del estudio es obligatorio.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre debe tener máximo 50 caracteres.",
            "any.required": "El nombre del estudio es obligatorio.",
        }),
    descripcion: Joi.string()
        .allow("", null)
        .max(1000)
        .messages({
            "string.max": "La descripción debe tener máximo 1000 caracteres.",
        }),
    tipo_arriendo: Joi.string()
        .valid("mensual", "por_hora")
        .required()
        .messages({
            "any.only": "El tipo de arriendo debe ser 'mensual' o 'por_hora'.",
            "any.required": "El tipo de arriendo es obligatorio.",
        }),
    capacidad: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "La capacidad debe ser un número.",
            "number.min": "La capacidad debe ser al menos 1 persona.",
            "any.required": "La capacidad es obligatoria.",
        }),
    ancho_metros: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "El ancho debe ser un número.",
            "number.positive": "El ancho debe ser mayor a 0.",
            "any.required": "El ancho en metros es obligatorio.",
        }),
    largo_metros: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "El largo debe ser un número.",
            "number.positive": "El largo debe ser mayor a 0.",
            "any.required": "El largo en metros es obligatorio.",
        }),
    precio: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "El precio debe ser un número.",
            "number.min": "El precio no puede ser negativo.",
            "any.required": "El precio es obligatorio.",
        }),
    imagen: Joi.string().allow("", null),
    disponible: Joi.boolean().optional(),
}).unknown(false);

export const ActualizarEstudioValidation = CrearEstudioValidation.fork(
    ["nombre", "tipo_arriendo", "capacidad", "ancho_metros", "largo_metros", "precio"],
    (schema) => schema.optional()
);