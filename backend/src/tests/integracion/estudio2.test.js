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

const putEstudio = (id, token, campos) => {
  const req = request(app).put(`/api/estudios/${id}`);
  if (token) req.set("Authorization", `Bearer ${token}`);
  Object.entries(campos).forEach(([k, v]) => req.field(k, v));
  return req;
};

describe("PUT /api/estudios/:id_estudio - Pruebas de Integración", () => {
  let idEstudio;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const creado = await request(app)
      .post("/api/estudios")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .field("nombre", "Estudio original")
      .field("tipo_arriendo", "mensual")
      .field("capacidad", "2")
      .field("ancho_metros", "4")
      .field("largo_metros", "5")
      .field("precio", "100000");
    idEstudio = creado.body.estudio?.id_estudio;
  });

  afterAll(async () => {
    if (idEstudio) {
      await request(app)
        .delete(`/api/estudios/${idEstudio}`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("debe responder 401 si no se envía token", async () => {
    const response = await putEstudio(idEstudio, null, { nombre: "Nuevo nombre" });

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe responder 403 si el rol es Cliente", async () => {
    const response = await putEstudio(idEstudio, tokenCliente, { nombre: "Nuevo nombre" });

    // Expectativa 2
    expect(response.statusCode).toBe(403);
  });

  it("debe responder 400 si la capacidad es inválida", async () => {
    const response = await putEstudio(idEstudio, tokenAdmin, { capacidad: "0" });

    // Expectativa 3
    expect(response.statusCode).toBe(400);
    // Expectativa 4
    expect(response.body.message).toBe("La capacidad debe ser al menos 1 persona.");
  });

  it("debe responder 404 si el estudio no existe", async () => {
    const response = await putEstudio(999999, tokenAdmin, { nombre: "Nuevo nombre" });

    // Expectativa 5
    expect(response.statusCode).toBe(404);
  });

  it("debe modificar el estudio con 200 cuando un Admin envía datos válidos", async () => {
    const response = await putEstudio(idEstudio, tokenAdmin, { nombre: "Estudio modificado", precio: "150000" });

    // Expectativa 6
    expect(response.statusCode).toBe(200);
    // Expectativa 7
    expect(response.body.estudio.nombre).toBe("Estudio modificado");
    // Expectativa 8
    expect(response.body.estudio.precio).toBe(150000);
  });
});