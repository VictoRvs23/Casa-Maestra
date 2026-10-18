"use strict";
import { AppDataSource } from "../config/configDb.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";
import bcrypt from "bcrypt";

export async function createUsuarios() {
  try {
    const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);
    
    const count = await usuarioRepository.count();
    if (count > 0) {
      console.log("=> Usuarios ya existentes en la base de datos.");
      return;
    }

    const usuarios = [
      {
        nombre_usuario: "AdminDemo",
        nombre: "Admin",
        apellido:"Casa Maestra",
        email: "admin@casamaestra.cl",
        contraseña: await bcrypt.hash("admin123", 10),
        telefono: "900000001",
        rol: "Admin"
      },
      {
        nombre_usuario: "FundadorDemo",
        nombre: "Fundador/a",
        apellido:"Casa Maestra",
        email: "fundador@casamaestra.cl",
        contraseña: await bcrypt.hash("fundador123", 10),
        telefono: "900000002",
        rol: "Fundador/a"
      },
      {
        nombre_usuario: "ResidenteDemo",
        nombre: "Residente",
        apellido:"Casa Maestra",
        email: "residente@casamaestra.cl",
        contraseña: await bcrypt.hash("residente123", 10),
        telefono: "900000003",
        rol: "Residente"
      },
      {
        nombre_usuario: "ArtistaDemo",
        nombre: "Artista",
        apellido:"Casa Maestra",
        email: "artista@casamaestra.cl",
        contraseña: await bcrypt.hash("artista123", 10),
        telefono: "900000003",
        rol: "Artista"
      },
      {
        nombre_usuario: "ClienteDemo",
        nombre: "Cliente",
        apellido:"Casa Maestra",
        email: "cliente@casamaestra.cl",
        contraseña: await bcrypt.hash("cliente123", 10),
        telefono: "900000004",
        rol: "Cliente"
      }
    ];

    console.log("=> Creando usuarios iniciales para la Casa Maestra...");
    
    for (const u of usuarios) {
      const nuevoUsuario = usuarioRepository.create(u);
      await usuarioRepository.save(nuevoUsuario);
      console.log(`Usuario '${u.nombre_usuario}' creado con éxito.`);
    }
    
  } catch (error) {
    console.error("=> Error al inicializar los usuarios:", error);
    throw error;
  }
}

export async function createEstudios() {
  try {
    const estudioRepository = AppDataSource.getRepository(EstudioEntity);

    const count = await estudioRepository.count();
    if (count > 0) {
      console.log("=> Estudios ya existentes en la base de datos.");
      return;
    }

    const estudios = [
      {
        nombre: "Estudio 1",
        descripcion: "Sala pequeña para trabajo individual.",
        tipo_arriendo: "mensual",
        capacidad: 2,
        ancho_metros: 3,
        largo_metros: 4,
        precio: 150000
      },
      {
        nombre: "Estudio 2",
        descripcion: "Sala mediana para pequeños equipos.",
        tipo_arriendo: "mensual",
        capacidad: 6,
        ancho_metros: 5,
        largo_metros: 6,
        precio: 250000
      },
      {
        nombre: "Estudio 3",
        descripcion: "Sala grande para talleres y grupos.",
        tipo_arriendo: "mensual",
        capacidad: 10,
        ancho_metros: 8,
        largo_metros: 10,
        precio: 400000
      }
    ];

    console.log("=> Creando estudios iniciales para la Casa Maestra...");

    for (const e of estudios) {
      const nuevoEstudio = estudioRepository.create(e);
      await estudioRepository.save(nuevoEstudio);
      console.log(`Estudio '${e.nombre}' creado con éxito.`);
    }

  } catch (error) {
    console.error("=> Error al inicializar los estudios:", error);
    throw error;
  }
}