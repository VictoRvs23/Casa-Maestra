import { describe, expect, it } from "vitest";
import {
  CrearResidenteValidation,
  ActualizarResidenteValidation,
} from "../../validations/residente.validation.js";

describe("Residente Validation - Pruebas Unitarias", () => {
  it("debe aceptar un residente válido y limpiar espacios del nombre", () => {
    const { error, value } = CrearResidenteValidation.validate({
      nombre: "  Taller Maestro  ",
      descripcion: "Cerámica artesanal",
    });
    // Expectativa 1
    expect(error).toBeUndefined();
    // Expectativa 2
    expect(value.nombre).toBe("Taller Maestro");
  });

  it("debe rechazar un residente sin nombre", () => {
    const { error } = CrearResidenteValidation.validate({ descripcion: "Sin nombre" });
    // Expectativa 3
    expect(error.message).toBe("El nombre del residente es obligatorio.");
  });

  it("debe rechazar una descripción de más de 150 caracteres", () => {
    const { error } = CrearResidenteValidation.validate({
      nombre: "Taller",
      descripcion: "a".repeat(151),
    });
    // Expectativa 4
    expect(error.message).toBe("La descripción debe tener máximo 150 caracteres.");
  });

  it("debe rechazar que se envíe 'imagen' en el body (solo llega por multer)", () => {
    const { error } = CrearResidenteValidation.validate({ nombre: "Taller", imagen: "/uploads/x.png" });
    // Expectativa 5
    expect(error).toBeDefined();
  });

  it("debe permitir actualizar sin enviar el nombre", () => {
    const { error } = ActualizarResidenteValidation.validate({ descripcion: "Nueva descripción" });
    // Expectativa 6
    expect(error).toBeUndefined();
  });
});