import Joi from "joi";

export const CrearArriendoValidation = Joi.object({
    id_estudio: Joi.number().integer().positive().required().messages({
        "any.required": "Debes indicar el estudio.",
        "number.base": "El estudio no es válido.",
    }),
    mes_inicio: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required()
        .messages({
            "string.pattern.base": "El mes de inicio debe tener formato YYYY-MM.",
            "any.required": "El mes de inicio es obligatorio.",
        }),
    meses: Joi.number().integer().min(1).max(12).required().messages({
        "number.min": "Debes arrendar al menos 1 mes.",
        "number.max": "Puedes arrendar hasta 12 meses seguidos.",
        "any.required": "La cantidad de meses es obligatoria.",
    }),
}).unknown(false);

export const DisponibilidadArriendosQueryValidation = Joi.object({
    cantidad: Joi.number().integer().min(1).max(12).default(12),
}).unknown(true);

export const ListadoArriendosQueryValidation = Joi.object({
    periodo: Joi.string().valid("activos", "finalizados", "cancelados", "todos").default("activos"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);