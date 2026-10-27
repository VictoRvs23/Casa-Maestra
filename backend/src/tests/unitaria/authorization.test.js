import { describe, expect, it, vi } from "vitest";
import { authorizeRoles } from "../../middleware/authorization.middleware.js";

const crearRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("authorizeRoles Middleware - Pruebas Unitarias", () => {
  const GestionEstudios = authorizeRoles("Fundador/a", "Admin");

  it("debe permitir el paso (next) cuando el rol está autorizado", () => {
    const req = { usuario: { rol: "Admin" } };
    const res = crearRes();
    const next = vi.fn();

    GestionEstudios(req, res, next);

    // Expectativa 1
    expect(next).toHaveBeenCalledTimes(1);
    // Expectativa 2
    expect(res.status).not.toHaveBeenCalled();
  });

  it("debe responder 403 cuando el rol no está autorizado", () => {
    const req = { usuario: { rol: "Cliente" } };
    const res = crearRes();
    const next = vi.fn();

    GestionEstudios(req, res, next);

    // Expectativa 3
    expect(res.status).toHaveBeenCalledWith(403);
    // Expectativa 4
    expect(next).not.toHaveBeenCalled();
  });

  it("debe responder 403 cuando no hay usuario en la request (sin token)", () => {
    const req = {};
    const res = crearRes();
    const next = vi.fn();

    GestionEstudios(req, res, next);

    // Expectativa 5
    expect(res.status).toHaveBeenCalledWith(403);
    // Expectativa 6
    expect(res.json.mock.calls[0][0].message).toContain("Fundador/a o Admin");
  });
});