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

const tokenAdmin = crearToken("Admin");
const tokenCliente = crearToken("Cliente");

const estudioValido = {
  nombre: "Estudio de prueba",
  descripcion: "Creado por una prueba de integración",
  tipo_arriendo: "mensual",
  capacidad: "2",
  ancho_metros: "4",
  largo_metros: "5",
  precio: "100000",
};

const postEstudio = (token, campos) => {
  const req = request(app).post("/api/estudios");
  if (token) req.set("Authorization", `Bearer ${token}`);
  Object.entries(campos).forEach(([k, v]) => req.field(k, v));
  return req;
};

describe("POST /api/estudios - Pruebas de Integración", () => {
  let idCreado;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (idCreado) {
      await request(app)
        .delete(`/api/estudios/${idCreado}`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("debe responder 401 si no se envía token", async () => {
    const response = await postEstudio(null, estudioValido);

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe responder 403 si el rol no es Admin ni Fundador/a", async () => {
    const response = await postEstudio(tokenCliente, estudioValido);

    // Expectativa 2
    expect(response.statusCode).toBe(403);
    // Expectativa 3
    expect(response.body.message).toContain("Fundador/a o Admin");
  });

  it("debe responder 400 si los datos del estudio son inválidos", async () => {
    const response = await postEstudio(tokenAdmin, { ...estudioValido, tipo_arriendo: "semanal" });

    // Expectativa 4
    expect(response.statusCode).toBe(400);
    // Expectativa 5
    expect(response.body.message).toBe("El tipo de arriendo debe ser 'mensual' o 'por_hora'.");
  });

  it("debe crear el estudio con status 201 cuando un Admin envía datos válidos", async () => {
    const response = await postEstudio(tokenAdmin, estudioValido);
    idCreado = response.body.estudio?.id_estudio;

    // Expectativa 6
    expect(response.statusCode).toBe(201);
    // Expectativa 7
    expect(response.body.estudio).toHaveProperty("id_estudio");
    // Expectativa 8
    expect(response.body.estudio.nombre).toBe("Estudio de prueba");
  });
});