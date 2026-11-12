import Joi from "joi";

const HORA_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CrearReservaValidation = Joi.object({
    fecha: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD.",
            "any.required": "La fecha es obligatoria.",
        }),
    hora_inicio: Joi.string()
        .pattern(HORA_PATTERN)
        .required()
        .messages({
            "string.pattern.base": "La hora de inicio debe tener formato HH:mm.",
            "any.required": "La hora de inicio es obligatoria.",
        }),
    hora_fin: Joi.string()
        .pattern(HORA_PATTERN)
        .required()
        .messages({
            "string.pattern.base": "La hora de fin debe tener formato HH:mm.",
            "any.required": "La hora de fin es obligatoria.",
        }),
}).unknown(false);

export const DisponibilidadQueryValidation = Joi.object({
    mes: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required()
        .messages({
            "string.pattern.base": "El mes debe tener formato YYYY-MM.",
            "any.required": "Debes indicar el mes (?mes=YYYY-MM).",
        }),
});

export const ListadoReservasQueryValidation = Joi.object({
    periodo: Joi.string()
        .valid("proximas", "pasadas", "canceladas", "todas")
        .default("proximas")
        .messages({ "any.only": "El período debe ser proximas, pasadas, canceladas o todas." }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);  