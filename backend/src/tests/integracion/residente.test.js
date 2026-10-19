import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import indexRoutes from "../../routes/index.routes.js";
import { AppDataSource } from "../../config/configDb.js";
import { JWT_SECRET } from "../../config/configEnv.js";

const app = express();
app.use(express.json());
app.use("/api", indexRoutes);

const crearToken = (rol) =>
  jwt.sign({ id_usuario: 1, email: "test@ejemplo.com", nombre: "Test", rol }, JWT_SECRET, { expiresIn: "1h" });

const tokenFundador = crearToken("Fundador/a");
const tokenCliente = crearToken("Cliente");

describe("POST /api/residentes - Pruebas de Integración", () => {
  let idCreado;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (idCreado) {
      await request(app)
        .delete(`/api/residentes/${idCreado}`)
        .set("Authorization", `Bearer ${tokenFundador}`);
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("debe responder 401 si no se envía token", async () => {
    const response = await request(app)
      .post("/api/residentes")
      .field("nombre", "Taller de prueba");

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe responder 403 si el rol es Cliente", async () => {
    const response = await request(app)
      .post("/api/residentes")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .field("nombre", "Taller de prueba");

    // Expectativa 2
    expect(response.statusCode).toBe(403);
  });

  it("debe responder 400 si falta el nombre", async () => {
    const response = await request(app)
      .post("/api/residentes")
      .set("Authorization", `Bearer ${tokenFundador}`)
      .field("descripcion", "Sin nombre");

    // Expectativa 3
    expect(response.statusCode).toBe(400);
    // Expectativa 4
    expect(response.body.message).toBe("El nombre del residente es obligatorio.");
  });

  it("debe crear el residente con 201 cuando un Fundador/a envía datos válidos", async () => {
    const response = await request(app)
      .post("/api/residentes")
      .set("Authorization", `Bearer ${tokenFundador}`)
      .field("nombre", "Taller de prueba")
      .field("descripcion", "Creado por una prueba de integración");
    idCreado = response.body.residente?.id_residente;

    // Expectativa 5
    expect(response.statusCode).toBe(201);
    // Expectativa 6
    expect(response.body.residente).toHaveProperty("id_residente");
    // Expectativa 7
    expect(response.body.residente.nombre).toBe("Taller de prueba");
  });
});