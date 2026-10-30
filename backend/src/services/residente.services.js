import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import { slugify } from "../src/helpers/slug.helper.js";
import { limpiarImagenesDeResidenteService } from "./pagina.services.js";
import fs from "fs";
import path from "path";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith("/uploads/residentes/")) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

const generarSlugUnico = async (nombre, id_excluir = null) => {
    const base = slugify(nombre);
    let slug = base;
    let n = 2;

    while (true) {
        const existente = await residenteRepository.findOneBy({ slug });
        if (!existente || existente.id_residente === id_excluir) return slug;
        slug = `${base}-${n}`;
        n++;
    }
};

const normalizarCuenta = (data) => {
    if ("id_usuario" in data) {
        data.id_usuario = data.id_usuario === "" || data.id_usuario === null ? null : Number(data.id_usuario);
    }
};

const validarCuenta = async (id_usuario, id_residente_actual = null) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario });

    if (!usuario) throw { status: 400, message: "La cuenta seleccionada no existe." };
    if (usuario.rol !== "Residente") {
        throw { status: 400, message: "La cuenta seleccionada no tiene el rol Residente." };
    }

    const ocupada = await residenteRepository.findOneBy({ id_usuario });
    if (ocupada && ocupada.id_residente !== id_residente_actual) {
        throw { status: 409, message: "Esa cuenta ya está asociada a otro residente." };
    }
};

export const getResidentesService = async (query = {}) => {
    const { busqueda, page = 1, limit = 12 } = query;

    const qb = residenteRepository.createQueryBuilder("residente")
        .orderBy("residente.id_residente", "ASC");

    if (busqueda) {
        qb.andWhere(
            "(residente.nombre ILIKE :busqueda OR residente.descripcion ILIKE :busqueda)",
            { busqueda: `%${busqueda}%` }
        );
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;

    qb.skip((pageNum - 1) * limitNum).take(limitNum);

    const [residentes, total] = await qb.getManyAndCount();

    return {
        residentes,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

export const getResidenteService = async (id_residente) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };
    return residente;
};

export const getCuentasDisponiblesService = async (id_residente) => {
    const idActual = parseInt(id_residente) || null;

    const tarjetas = await residenteRepository.find({
        select: { id_residente: true, id_usuario: true },
    });
    const ocupadas = tarjetas
        .filter((t) => t.id_usuario && t.id_residente !== idActual)
        .map((t) => t.id_usuario);

    const cuentas = await usuarioRepository.find({
        where: { rol: "Residente" },
        select: { id_usuario: true, nombre: true, apellido: true, nombre_usuario: true },
        order: { nombre: "ASC" },
    });

    return cuentas.filter((c) => !ocupadas.includes(c.id_usuario));
};

export const createResidenteService = async (data) => {
    normalizarCuenta(data);
    if (data.id_usuario) await validarCuenta(data.id_usuario);

    const slug = await generarSlugUnico(data.nombre);
    const nuevoResidente = residenteRepository.create({ ...data, slug });
    return await residenteRepository.save(nuevoResidente);
};

export const updateResidenteService = async (id_residente, data) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };

    if (Object.keys(data).length === 0) return residente;

    normalizarCuenta(data);
    if (data.id_usuario) await validarCuenta(data.id_usuario, residente.id_residente);

    if (data.nombre !== undefined && data.nombre !== residente.nombre) {
        data.slug = await generarSlugUnico(data.nombre, residente.id_residente);
    }

    if (data.imagen !== undefined && data.imagen !== residente.imagen) {
        borrarImagenLocal(residente.imagen);
    }

    await residenteRepository.update(id_residente, data);
    return await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });
};

export const deleteResidenteService = async (id_residente) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };

    borrarImagenLocal(residente.imagen);
    await limpiarImagenesDeResidenteService(residente.id_residente);
    await residenteRepository.delete(id_residente);
    return true;
};
