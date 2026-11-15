"use strict";

import Joi from "joi";

export const IdNotificacionParamValidation = Joi.object({
    id_notificacion: Joi.number().integer().positive().required().messages({
        "number.base": "La notificación no es válida.",
        "number.integer": "La notificación no es válida.",
        "number.positive": "La notificación no es válida.",
        "any.required": "Debes indicar la notificación.",
    }),
});

export const ListarNotificacionesQueryValidation = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
}).messages({
    "number.base": "La paginación no es válida.",
    "number.min": "La paginación no es válida.",
    "number.max": "Puedes pedir hasta 50 notificaciones por vez.",
});