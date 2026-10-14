import { describe, expect, it } from "vitest";
import { comparePassword, encryptPassword } from "../../helpers/bcrypt.helper.js";

describe("Bcrypt Helper - Pruebas Unitarias", () => {
  it("debe encriptar una contraseña correctamente y generar un hash válido", async () => {
    const password = "Password123!";
    const hash = await encryptPassword(password);
    // Expectativa 1
    expect(hash).toBeDefined();
    // Expectativa 2
    expect(hash).not.toBe(password);
  });

  it("debe retornar true cuando la contraseña coincide con el hash", async () => {
    const password = "Password123!";
    const hash = await encryptPassword(password);
    const isValid = await comparePassword(password, hash);
    // Expectativa 3
    expect(isValid).toBe(true);
  });

  it("debe retornar false si la contraseña es incorrecta", async () => {
    const password = "Password123!";
    const hash = await encryptPassword(password);
    const isValid = await comparePassword("WrongPassword", hash);
    // Expectativa 4
    expect(isValid).toBe(false);
  });
});