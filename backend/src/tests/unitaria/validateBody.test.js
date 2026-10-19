import { describe, expect, it, vi } from "vitest";
import Joi from "joi";
import { validateBody } from "../../middleware/validateBody.js";

const crearRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const schema = Joi.object({
  nombre: Joi.string().required().messages({ "any.required": "El nombre es obligatorio." }),
  edad: Joi.number().required(),
});

describe("validateBody Middleware - Pruebas Unitarias", () => {
  it("debe llamar a next y convertir los tipos cuando el body es válido", () => {
    const req = { body: { nombre: "Ana", edad: "30" } };
    const res = crearRes();
    const next = vi.fn();

    validateBody(schema)(req, res, next);

    // Expectativa 1
    expect(next).toHaveBeenCalledTimes(1);
    // Expectativa 2
    expect(req.body.edad).toBe(30);
  });

  it("debe responder 400 con el primer mensaje de error cuando el body es inválido", () => {
    const req = { body: { edad: 30 } };
    const res = crearRes();
    const next = vi.fn();

    validateBody(schema)(req, res, next);

    // Expectativa 3
    expect(res.status).toHaveBeenCalledWith(400);
    // Expectativa 4
    expect(res.json.mock.calls[0][0].message).toBe("El nombre es obligatorio.");
    // Expectativa 5
    expect(next).not.toHaveBeenCalled();
  });

  it("debe devolver la lista completa de errores (abortEarly: false)", () => {
    const req = { body: {} };
    const res = crearRes();

    validateBody(schema)(req, res, vi.fn());

    // Expectativa 6
    expect(res.json.mock.calls[0][0].errors).toHaveLength(2);
  });
});