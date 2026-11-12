import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import indexRoutes from "../../routes/index.routes.js";
import { AppDataSource } from "../../config/configDb.js";
import { JWT_SECRET } from "../../config/configEnv.js";
import UsuarioEntity from "../../entities/usuario.entity.js";
import EstudioEntity from "../../entities/estudio.entity.js";
import { createEstudio0 } from "../../config/InitEstudio0.js";
import { ahoraEnChile } from "../../helpers/horarios.helper.js";
import { sumarMeses } from "../../helpers/meses.helper.js";

const app = express();
app.use(express.json());
app.use("/api", indexRoutes);

const firmar = (u) =>
  jwt.sign({ id_usuario: u.id_usuario, email: u.email, nombre: u.nombre, rol: u.rol }, JWT_SECRET, { expiresIn: "1h" });

const sufijo = Date.now();
const telefono = () => `9${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

describe("Arriendo mensual de estudios - Pruebas de Integración", () => {
  const precio = 150000;
  const mesActual = ahoraEnChile().fecha.slice(0, 7);
  const mesInicio = sumarMeses(mesActual, 2);
  const mesesArrendados = [mesInicio, sumarMeses(mesInicio, 1), sumarMeses(mesInicio, 2)];

  let estudio;
  let estudio0;
  let dueño;
  let otro;
  let tokenDueño;
  let tokenOtro;
  let idArriendo;

  const arrendar = (token, datos) =>
    request(app).post("/api/arriendos").set("Authorization", `Bearer ${token}`).send(datos);

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    estudio0 = await createEstudio0();

    estudio = await AppDataSource.getRepository(EstudioEntity).save({
      nombre: `Estudio arriendo ${sufijo}`,
      descripcion: "Creado por una prueba de integración",
      tipo_arriendo: "mensual",
      capacidad: 2,
      ancho_metros: 3,
      largo_metros: 4,
      precio,
      disponible: true,
    });

    const repo = AppDataSource.getRepository(UsuarioEntity);
    const crear = (nombre) =>
      repo.save({
        nombre_usuario: `${nombre}_${sufijo}`,
        nombre,
        apellido: "Arriendo",
        email: `${nombre}.${sufijo}@ejemplo.com`,
        contraseña: "no-importa",
        telefono: telefono(),
        rol: "Cliente",
      });
    dueño = await crear("dueno");
    otro = await crear("otro");
    tokenDueño = firmar(dueño);
    tokenOtro = firmar(otro);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.getRepository(EstudioEntity).delete(estudio.id_estudio);
      await AppDataSource.getRepository(UsuarioEntity).delete([dueño.id_usuario, otro.id_usuario]);
      await AppDataSource.destroy();
    }
  });

  it("debe mostrar la disponibilidad de 12 meses sin pedir sesión", async () => {
    const response = await request(app).get("/api/arriendos/disponibilidad");

    // Expectativa 1
    expect(response.statusCode).toBe(200);
    // Expectativa 2
    expect(response.body.meses).toHaveLength(12);
    // Expectativa 3
    expect(response.body.meses[0]).toBe(mesActual);
  });

  it("debe responder 401 al arrendar sin sesión", async () => {
    const response = await request(app)
      .post("/api/arriendos")
      .send({ id_estudio: estudio.id_estudio, mes_inicio: mesInicio, meses: 1 });

    // Expectativa 4
    expect(response.statusCode).toBe(401);
  });

  it("debe confirmar un arriendo de 3 meses y calcular el total", async () => {
    const response = await arrendar(tokenDueño, { id_estudio: estudio.id_estudio, mes_inicio: mesInicio, meses: 3 });
    idArriendo = response.body.arriendo?.id_arriendo;

    // Expectativa 5
    expect(response.statusCode).toBe(201);
    // Expectativa 6
    expect(response.body.arriendo.total).toBe(precio * 3);
    // Expectativa 7
    expect(response.body.arriendo.fecha_inicio).toBe(`${mesInicio}-01`);
  });

  it("debe marcar esos 3 meses como ocupados, y solo en ese estudio", async () => {
    const response = await request(app).get("/api/arriendos/disponibilidad");
    const ocupados = response.body.ocupados[String(estudio.id_estudio)];

    // Expectativa 8
    expect(ocupados).toEqual(mesesArrendados);
    // Expectativa 9
    expect(response.body.ocupados[String(estudio0.id_estudio)]).toBeUndefined();
  });

  it("debe responder 409 si otra persona pide un mes que se cruza con el arriendo", async () => {
    const response = await arrendar(tokenOtro, {
      id_estudio: estudio.id_estudio,
      mes_inicio: mesesArrendados[2],
      meses: 2,
    });

    // Expectativa 10
    expect(response.statusCode).toBe(409);
  });

  it("debe permitir arrendar el mes siguiente al último arrendado", async () => {
    const siguiente = sumarMeses(mesesArrendados[2], 1);
    const response = await arrendar(tokenOtro, { id_estudio: estudio.id_estudio, mes_inicio: siguiente, meses: 1 });

    // Expectativa 11
    expect(response.statusCode).toBe(201);
  });

  it("debe rechazar un mes pasado, uno demasiado lejano y más de 12 meses", async () => {
    const pasado = await arrendar(tokenOtro, {
      id_estudio: estudio.id_estudio,
      mes_inicio: sumarMeses(mesActual, -1),
      meses: 1,
    });
    const lejano = await arrendar(tokenOtro, {
      id_estudio: estudio.id_estudio,
      mes_inicio: sumarMeses(mesActual, 12),
      meses: 1,
    });
    const demasiados = await arrendar(tokenOtro, { id_estudio: estudio.id_estudio, mes_inicio: mesInicio, meses: 13 });

    // Expectativa 12
    expect(pasado.statusCode).toBe(400);
    // Expectativa 13
    expect(lejano.statusCode).toBe(400);
    // Expectativa 14
    expect(demasiados.statusCode).toBe(400);
  });

  it("no debe permitir arrendar el Estudio 0, que se reserva por hora", async () => {
    const response = await arrendar(tokenOtro, { id_estudio: estudio0.id_estudio, mes_inicio: mesInicio, meses: 1 });

    // Expectativa 15
    expect(response.statusCode).toBe(400);
  });

  it("debe responder 403 si alguien cancela un arriendo que no es suyo", async () => {
    const response = await request(app)
      .delete(`/api/arriendos/${idArriendo}`)
      .set("Authorization", `Bearer ${tokenOtro}`);

    // Expectativa 16
    expect(response.statusCode).toBe(403);
  });

  it("debe liberar los meses cuando quien arrendó cancela antes de que empiece", async () => {
    const cancelar = await request(app)
      .delete(`/api/arriendos/${idArriendo}`)
      .set("Authorization", `Bearer ${tokenDueño}`);
    const disponibilidad = await request(app).get("/api/arriendos/disponibilidad");
    const ocupados = disponibilidad.body.ocupados[String(estudio.id_estudio)] || [];

    // Expectativa 17
    expect(cancelar.statusCode).toBe(200);
    // Expectativa 18
    expect(ocupados.filter((m) => mesesArrendados.slice(0, 3).includes(m))).toEqual([]);
  });

  it("debe responder 409 si se cancela dos veces el mismo arriendo", async () => {
    const response = await request(app)
      .delete(`/api/arriendos/${idArriendo}`)
      .set("Authorization", `Bearer ${tokenDueño}`);

    // Expectativa 19
    expect(response.statusCode).toBe(409);
  });
});