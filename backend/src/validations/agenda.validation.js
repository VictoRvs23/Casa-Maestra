import Joi from "joi";

const HORA_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/; 

const BloqueValidation = Joi.object({
    dia_semana: Joi.number()
        .integer()
        .min(0)
        .max(6)
        .required()
        .messages({
            "number.min": "El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado).",
            "number.max": "El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado).",
            "any.required": "El día de la semana es obligatorio.",
        }),
    hora_inicio: Joi.string()
        .pattern(HORA_PATTERN)
        .required()
        .messages({
            "string.pattern.base": "La hora de inicio debe tener formato HH:mm (ej: 09:00).",
            "any.required": "La hora de inicio es obligatoria.",
        }),
    hora_fin: Joi.string()
        .pattern(HORA_PATTERN)
        .required()
        .messages({
            "string.pattern.base": "La hora de fin debe tener formato HH:mm (ej: 18:00).",
            "any.required": "La hora de fin es obligatoria.",
        }),
    activo: Joi.boolean().optional(),
}).custom((value, helpers) => {
    if (value.hora_inicio >= value.hora_fin) {
        return helpers.message("La hora de fin debe ser posterior a la hora de inicio.");
    }
    return value;
});

export const SemanaAgendaValidation = Joi.object({
    bloques: Joi.array().items(BloqueValidation).min(0).required(),
});