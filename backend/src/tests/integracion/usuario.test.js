import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import indexRoutes from "../../routes/index.routes.js";
import { AppDataSource } from "../../config/configDb.js";
import { JWT_SECRET } from "../../config/configEnv.js";
import UsuarioEntity from "../../entities/usuario.entity.js";
import { encryptPassword } from "../../helpers/bcrypt.helper.js";

const app = express();
app.use(express.json());
app.use("/api", indexRoutes);

const crearToken = (id_usuario, rol) =>
  jwt.sign({ id_usuario, email: "test@ejemplo.com", nombre: "Test", rol }, JWT_SECRET, { expiresIn: "1h" });

describe("PUT /api/usuarios/:id_usuario - Pruebas de Integración", () => {
  let usuarioPrueba;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const sufijo = Date.now();
    const repo = AppDataSource.getRepository(UsuarioEntity);
    usuarioPrueba = await repo.save(
      repo.create({
        nombre_usuario: `test_${sufijo}`,
        nombre: "Nombre Original",
        apellido: "Apellido Prueba",
        email: `test_${sufijo}@ejemplo.com`,
        contraseña: await encryptPassword("Password123!"),
        telefono: "912345678",
        rol: "Cliente",
      })
    );
  });

  afterAll(async () => {
    if (usuarioPrueba) {
      await AppDataSource.getRepository(UsuarioEntity).delete(usuarioPrueba.id_usuario);
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("debe responder 401 si no se envía token", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioPrueba.id_usuario}`)
      .send({ nombre: "Otro Nombre" });

    // Expectativa 1
    expect(response.statusCode).toBe(401);
  });

  it("debe responder 403 si un Cliente intenta editar el perfil de otro usuario", async () => {
    const tokenOtro = crearToken(usuarioPrueba.id_usuario + 1000, "Cliente");
    const response = await request(app)
      .put(`/api/usuarios/${usuarioPrueba.id_usuario}`)
      .set("Authorization", `Bearer ${tokenOtro}`)
      .send({ nombre: "Otro Nombre" });

    // Expectativa 2
    expect(response.statusCode).toBe(403);
    // Expectativa 3
    expect(response.body.message).toBe("No tienes permiso para editar este perfil.");
  });

  it("debe responder 404 si un Admin edita un usuario que no existe", async () => {
    const response = await request(app)
      .put("/api/usuarios/999999")
      .set("Authorization", `Bearer ${crearToken(1, "Admin")}`)
      .send({ nombre: "Otro Nombre" });

    // Expectativa 4
    expect(response.statusCode).toBe(404);
  });

  it("debe modificar el perfil con 200 cuando el usuario edita su propia cuenta", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioPrueba.id_usuario}`)
      .set("Authorization", `Bearer ${crearToken(usuarioPrueba.id_usuario, "Cliente")}`)
      .send({ nombre: "Nombre Modificado" });

    // Expectativa 5
    expect(response.statusCode).toBe(200);
    // Expectativa 6
    expect(response.body.usuario.nombre).toBe("Nombre Modificado");
  });

  it("no debe cambiar la contraseña por esta ruta aunque se envíe en el body", async () => {
    const response = await request(app)
      .put(`/api/usuarios/${usuarioPrueba.id_usuario}`)
      .set("Authorization", `Bearer ${crearToken(usuarioPrueba.id_usuario, "Cliente")}`)
      .send({ nombre: "Nombre Modificado", contraseña: "HackeoNuevo123" });

    // Expectativa 7
    expect(response.statusCode).toBe(200);
    // Expectativa 8
    const guardado = await AppDataSource.getRepository(UsuarioEntity).findOneBy({
      id_usuario: usuarioPrueba.id_usuario,
    });
    expect(guardado.contraseña).not.toBe("HackeoNuevo123");
  });
});