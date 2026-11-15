"use strict";

import Joi from "joi";

export const ResidenteParamValidation = Joi.object({
    id_residente: Joi.number().integer().positive().required().messages({
        "number.base": "El residente no es válido.",
        "number.integer": "El residente no es válido.",
        "number.positive": "El residente no es válido.",
        "any.required": "Debes indicar el residente.",
    }),
});