import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import indexRoutes from "../../routes/index.routes.js";
import { AppDataSource } from "../../config/configDb.js";
import { JWT_SECRET } from "../../config/configEnv.js";
import UsuarioEntity from "../../entities/usuario.entity.js";
import { createEstudio0 } from "../../config/InitEstudio0.js";
import { ahoraEnChile, diaSemanaDe } from "../../helpers/horarios.helper.js";

const app = express();
app.use(express.json());
app.use("/api", indexRoutes);

const lunesDentroDeUnMes = () => {
  const [y, m, d] = ahoraEnChile().fecha.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + 28));
  while (diaSemanaDe(f.toISOString().slice(0, 10)) !== 1) f.setUTCDate(f.getUTCDate() + 1);
  return f.toISOString().slice(0, 10);
};

const firmar = (u) =>
  jwt.sign({ id_usuario: u.id_usuario, email: u.email, nombre: u.nombre, rol: u.rol }, JWT_SECRET, { expiresIn: "1h" });

const sufijo = Date.now();
const telefono = () => `9${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

describe("Permisos y 'Mis reservas' del Estudio 0 - Pruebas de Integración", () => {
  const fecha = lunesDentroDeUnMes();
  let dueño;
  let otro;
  let fundador;
  let tokenDueño;
  let tokenOtro;
  let tokenFundador;
  let idReserva;

  const misReservas = (token) => request(app).get("/api/reservas/mias").set("Authorization", `Bearer ${token}`);

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    await createEstudio0();

    const repo = AppDataSource.getRepository(UsuarioEntity);
    const crear = (nombre, rol) =>
      repo.save({
        nombre_usuario: `${nombre}_${sufijo}`,
        nombre,
        apellido: "Permisos",
        email: `${nombre}.${sufijo}@ejemplo.com`,
        contraseña: "no-importa",
        telefono: telefono(),
        rol,
      });
    dueño = await crear("duena", "Cliente");
    otro = await crear("otro", "Cliente");
    fundador = await crear("gestor", "Fundador/a");
    tokenDueño = firmar(dueño);
    tokenOtro = firmar(otro);
    tokenFundador = firmar(fundador);

    const reserva = await request(app)
      .post("/api/estudio0/reservas")
      .set("Authorization", `Bearer ${tokenDueño}`)
      .send({ fecha, hora_inicio: "14:00", hora_fin: "15:00" });
    idReserva = reserva.body.reserva?.id_reserva;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.getRepository(UsuarioEntity).delete([dueño.id_usuario, otro.id_usuario, fundador.id_usuario]);
      await AppDataSource.destroy();
    }
  });

  it("debe responder 401 al pedir 'mis reservas' sin sesión", async () => {
    const response = await request(app).get("/api/reservas/mias");

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe mostrar la reserva a quien la hizo, con los datos del estudio", async () => {
    const response = await misReservas(tokenDueño);
    const reserva = response.body.find((r) => r.id_reserva === idReserva);

    // Expectativa 2
    expect(response.statusCode).toBe(200);
    // Expectativa 3
    expect(reserva).toBeDefined();
    // Expectativa 4
    expect(reserva.estudio.tipo_arriendo).toBe("por_hora");
  });

  it("no debe mostrar la reserva a otra persona", async () => {
    const response = await misReservas(tokenOtro);

    // Expectativa 5
    expect(response.statusCode).toBe(200);
    // Expectativa 6
    expect(response.body.find((r) => r.id_reserva === idReserva)).toBeUndefined();
  });

  it("debe responder 403 si alguien intenta cancelar una reserva ajena, y la reserva debe seguir confirmada", async () => {
    const cancelar = await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set("Authorization", `Bearer ${tokenOtro}`);
    const despues = await misReservas(tokenDueño);

    // Expectativa 7
    expect(cancelar.statusCode).toBe(403);
    // Expectativa 8
    expect(despues.body.find((r) => r.id_reserva === idReserva).estado).toBe("confirmada");
  });

  it("debe responder 404 al cancelar una reserva que no existe", async () => {
    const response = await request(app)
      .delete("/api/reservas/999999999")
      .set("Authorization", `Bearer ${tokenFundador}`);

    // Expectativa 9
    expect(response.statusCode).toBe(404);
  });

  it("debe dejar que un Fundador/a cancele la reserva de otra persona", async () => {
    const response = await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set("Authorization", `Bearer ${tokenFundador}`);

    // Expectativa 10
    expect(response.statusCode).toBe(200);
  });

  it("debe conservar la reserva cancelada en el historial en vez de borrarla", async () => {
    const response = await misReservas(tokenDueño);
    const reserva = response.body.find((r) => r.id_reserva === idReserva);

    // Expectativa 11
    expect(reserva).toBeDefined();
    // Expectativa 12
    expect(reserva.estado).toBe("cancelada");
  });
});