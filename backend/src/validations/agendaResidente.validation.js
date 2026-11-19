import Joi from "joi";

const HORA = /^([01]\d|2[0-3]):(00|15|30|45)$/;

export const TIPOS_SERVICIO = ["servicio", "producto"];

export const ServicioValidation = Joi.object({
    tipo: Joi.string()
        .valid(...TIPOS_SERVICIO)
        .required()
        .messages({
            "any.only": "El tipo debe ser servicio o producto.",
            "any.required": "Indica si es un servicio o un producto.",
        }),
    nombre: Joi.string()
        .trim()
        .min(2)
        .max(80)
        .required()
        .messages({
            "string.empty": "El nombre es obligatorio.",
            "string.min": "El nombre debe tener al menos 2 caracteres.",
            "string.max": "El nombre puede tener hasta 80 caracteres.",
            "any.required": "El nombre es obligatorio.",
        }),
    descripcion: Joi.string().trim().max(500).allow("", null).messages({
        "string.max": "La descripción puede tener hasta 500 caracteres.",
    }),
    precio: Joi.number().integer().min(0).max(10000000).allow("", null).messages({
        "number.base": "El precio debe ser un número.",
        "number.integer": "El precio debe ser un número entero (sin decimales).",
        "number.min": "El precio no puede ser negativo.",
        "number.max": "El precio es demasiado alto.",
    }),
    duracion_min: Joi.number().integer().min(15).max(720).multiple(15).allow("", null).messages({
        "number.base": "La duración debe ser un número de minutos.",
        "number.min": "La duración mínima es 15 minutos.",
        "number.max": "La duración máxima es 12 horas.",
        "number.multiple": "La duración debe ser múltiplo de 15 minutos.",
    }),
    activo: Joi.boolean().messages({ "boolean.base": "El estado no es válido." }),
    quitar_imagen: Joi.boolean(),
}).unknown(false);

export const HorariosValidation = Joi.object({
    bloques: Joi.array()
        .items(
            Joi.object({
                dia_semana: Joi.number().integer().min(0).max(6).required(),
                hora_inicio: Joi.string().pattern(HORA).required().messages({
                    "string.pattern.base": "Las horas deben tener formato HH:mm y minutos 00, 15, 30 o 45.",
                }),
                hora_fin: Joi.string().pattern(HORA).required().messages({
                    "string.pattern.base": "Las horas deben tener formato HH:mm y minutos 00, 15, 30 o 45.",
                }),
            }).unknown(false)
        )
        .max(42)
        .required()
        .messages({
            "array.max": "Hay demasiados bloques.",
            "any.required": "Debes enviar los bloques.",
        }),
}).unknown(false);

export const CitaValidation = Joi.object({
    id_servicio: Joi.number().integer().min(1).required().messages({
        "any.required": "Elige un servicio o producto.",
        "number.base": "El servicio no es válido.",
    }),
    fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow("", null).messages({
        "string.pattern.base": "La fecha no es válida.",
    }),
    hora_inicio: Joi.string().pattern(HORA).allow("", null).messages({
        "string.pattern.base": "La hora no es válida.",
    }),
    nota: Joi.string().trim().max(300).allow("", null).messages({
        "string.max": "La nota puede tener hasta 300 caracteres.",
    }),
}).unknown(false);

export const RespuestaCitaValidation = Joi.object({
    accion: Joi.string().valid("aceptar", "rechazar").required().messages({
        "any.only": "La acción debe ser aceptar o rechazar.",
        "any.required": "Indica si aceptas o rechazas.",
    }),
}).unknown(false);
