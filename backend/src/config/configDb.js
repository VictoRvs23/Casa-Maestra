"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, DB_PASSWORD, DB_PORT } from "./configEnv.js";
import UsuarioEntity from "../entities/usuario.entity.js"
import EstudioEntity from "../entities/estudio.entity.js";
import AgendaEntity from "../entities/agenda.entity.js";
import { createUsuarios } from "./InitDb.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: `${DB_PORT}`,
  username: `${DB_USERNAME}`,
  password: `${DB_PASSWORD}`,
  database: `${DATABASE}`,
  entities: [
    UsuarioEntity,
    EstudioEntity,
    AgendaEntity
  ],
  synchronize: true,
  logging: false,
  dropSchema: true,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión a BD exitosa <=");

    await createUsuarios();

  } catch (error) {
    console.error("=> Error al conectar a BD:", error);
    throw error;
  }
}