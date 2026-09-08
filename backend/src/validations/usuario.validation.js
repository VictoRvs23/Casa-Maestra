import Joi from "joi";

export const RegistroValidation = Joi.object({
    nombre_usuario: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        "string.empty": "El nombre de usuario es obligatorio.",
        "string.min": "El nombre de usuario debe tener al menos 3 caracteres.",
        "string.max": "El nombre de usuario debe tener maximo 50 caracteres.",
        "any.required": "El nombre de usuario es obligatorio."
    }),
    nombre: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        "string.empty": "El nombre es obligatorio.",
        "string.min": "El nombre debe tener al menos 3 caracteres.",
        "string.max": "El nombre debe tener maximo 50 caracteres.",
        "any.required": "El nombre es obligatorio."
    }),
    apellido: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        "string.empty": "El apellido es obligatorio.",
        "string.min": "El apellido debe tener al menos 3 caracteres.",
        "string.max": "El apellido debe tener maximo 50 caracteres.",
        "any.required": "El apellido es obligatorio"
    }),
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.email": "El correo electrónico debe ser válido.",
        "any.required": "El correo es obligatorio.",
    }),
    contraseña: Joi.string()
    .min(6)
    .required()
    .messages({
        "string.min": "La contraseña debe tener al menos 6 caracteres.",
        "any.required": "La contraseña es obligatoria."
    }),
    telefono: Joi.string()
    .length(9)
    .pattern(/^9[0-9]{8}$/)
    .required()
    .messages({
        "string.length": "El número debe tener 9 dígitos.",
        "string.pattern.base": "El número debe comenzar con 9 (Ej: 9 12345678).",
    }),
    rol: Joi.string()
    .valid(
        "Fundador/a", "Cliente", "Admin", "Residente", "Artista"
    )
    .optional()
}).unknown(false);

export const LoginValidation = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        "string.email": "El correo electrónico debe ser válido.",
        "any.required": "El correo es obligatorio.",
    }),
    contraseña: Joi.string()
    .min(6)
    .required()
    .messages({
        "string.min": "La contraseña debe tener al menos 6 caracteres.",
        "any.required": "La contraseña es obligatoria."
    }),
}).unknown(false);