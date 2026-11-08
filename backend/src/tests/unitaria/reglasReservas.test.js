import { describe, expect, it } from "vitest";
import {
  aHora,
  aMinutos,
  chocaConReservas,
  esFechaValida,
  estadoDeLasHoras,
  normalizarHora,
  validarRango,
} from "../../helpers/horarios.helper.js";

const bloques = [{ hora_inicio: "10:00", hora_fin: "14:00" }];
const ahora = { fecha: "2026-11-01", minutos: 600 };
const base = { fecha: "2026-11-05", bloques, reservas: [], ahora };

describe("Reglas de reserva por hora - Pruebas Unitarias", () => {
  it("debe convertir horas a minutos y de vuelta, incluso con el formato de Postgres", () => {
    // Expectativa 1:
    expect(aMinutos("10:00:00")).toBe(600);
    // Expectativa 2
    expect(aHora(1170)).toBe("19:30");
    // Expectativa 3
    expect(normalizarHora("10:00:00")).toBe("10:00");
  });

  it("debe validar fechas reales y rechazar las que no existen", () => {
    // Expectativa 4: 2028 es bisiesto
    expect(esFechaValida("2028-02-29")).toBe(true);
    // Expectativa 5: febrero no tiene 30 días
    expect(esFechaValida("2026-02-30")).toBe(false);
    // Expectativa 6: mes inexistente
    expect(esFechaValida("2026-13-01")).toBe(false);
  });

  it("no debe considerar choque a una hora que solo toca el borde de otra reserva", () => {
    const reservas = [{ hora_inicio: "11:00", hora_fin: "12:00" }];

    // Expectativa 7
    expect(chocaConReservas(600, 660, reservas)).toBe(false);
    // Expectativa 8
    expect(chocaConReservas(660, 720, reservas)).toBe(true);
  });

  it("debe marcar cada hora del día como pasada, libre u ocupada", () => {
    const hoy = { fecha: "2026-11-05", minutos: 660 };
    const reservas = [{ hora_inicio: "12:00", hora_fin: "13:00" }];

    const estados = estadoDeLasHoras({ fecha: "2026-11-05", bloques, reservas, ahora: hoy }).map((h) => h.estado);

    // Expectativa 9
    expect(estados).toEqual(["pasada", "pasada", "ocupada", "libre"]);
  });

  it("debe rechazar reservas que no son por horas completas o con el fin antes del inicio", () => {
    const mediaHora = validarRango({ ...base, hora_inicio: "10:00", hora_fin: "10:30" });
    const alReves = validarRango({ ...base, hora_inicio: "12:00", hora_fin: "11:00" });

    // Expectativa 10
    expect(mediaHora.message).toBe("Las reservas son por horas completas.");
    // Expectativa 11
    expect(alReves.status).toBe(400);
  });

  it("debe aceptar exactamente 4 horas seguidas, que es el máximo permitido", () => {
    // Expectativa 12
    expect(validarRango({ ...base, hora_inicio: "10:00", hora_fin: "14:00" })).toBeNull();
  });

  it("debe rechazar cualquier hora en un día sin agenda", () => {
    const cerrado = validarRango({ ...base, bloques: [], hora_inicio: "10:00", hora_fin: "11:00" });

    // Expectativa 13
    expect(cerrado.message).toBe("Ese horario no está disponible en la agenda del Estudio 0.");
  });
});