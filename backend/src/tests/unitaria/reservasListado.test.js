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

const lunesLejano = () => {
  const [y, m, d] = ahoraEnChile().fecha.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + 21));
  while (diaSemanaDe(f.toISOString().slice(0, 10)) !== 1) f.setUTCDate(f.getUTCDate() + 1);
  return f.toISOString().slice(0, 10);
};

const firmar = (u, rol) =>
  jwt.sign({ id_usuario: u.id_usuario, email: u.email, nombre: u.nombre, rol }, JWT_SECRET, { expiresIn: "1h" });

describe("Listado de reservas del Estudio 0 - Pruebas de Integración", () => {
  let tokenCliente;
  let tokenFundador;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    await createEstudio0();

    const repo = AppDataSource.getRepository(UsuarioEntity);
    const cliente = await repo.save({
      nombre_usuario: "cliente_listado",
      nombre: "Cliente",
      apellido: "Listado",
      email: "cliente.listado@ejemplo.com",
      contraseña: "no-importa",
      telefono: "912345679",
      rol: "Cliente",
    });
    const fundador = await repo.save({
      nombre_usuario: "fundador_listado",
      nombre: "Fundador",
      apellido: "Gestor",
      email: "fundador.listado@ejemplo.com",
      contraseña: "no-importa",
      telefono: "912345670",
      rol: "Fundador/a",
    });
    tokenCliente = firmar(cliente, "Cliente");
    tokenFundador = firmar(fundador, "Fundador/a");

    await request(app)
      .post("/api/estudio0/reservas")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ fecha: lunesLejano(), hora_inicio: "17:00", hora_fin: "18:00" });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });

  it("debe rechazar el listado sin sesión", async () => {
    const response = await request(app).get("/api/reservas");

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe rechazar el listado a un usuario sin rol de gestión", async () => {
    const response = await request(app).get("/api/reservas").set("Authorization", `Bearer ${tokenCliente}`);

    // Expectativa 2
    expect(response.statusCode).toBe(403);
  });

  it("debe listar las próximas reservas con la persona que reservó, sin exponer su contraseña", async () => {
    const response = await request(app)
      .get("/api/reservas?periodo=proximas")
      .set("Authorization", `Bearer ${tokenFundador}`);

    // Expectativa 3
    expect(response.statusCode).toBe(200);
    const reserva = response.body.reservas.find((r) => r.usuario?.email === "cliente.listado@ejemplo.com");
    // Expectativa 4
    expect(reserva).toBeDefined();
    // Expectativa 5
    expect(reserva.horas).toBe(1);
    // Expectativa 6
    expect(reserva.usuario).not.toHaveProperty("contraseña");
    // Expectativa 7
    expect(response.body.cuentas).toHaveProperty("proximas");
  });

  it("debe rechazar un período inválido", async () => {
    const response = await request(app)
      .get("/api/reservas?periodo=cualquiera")
      .set("Authorization", `Bearer ${tokenFundador}`);

    // Expectativa 8
    expect(response.statusCode).toBe(400);
  });
});