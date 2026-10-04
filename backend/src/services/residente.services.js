import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import fs from "fs";
import path from "path";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith("/uploads/residentes/")) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
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

export const createResidenteService = async (data) => {
    const nuevoResidente = residenteRepository.create(data);
    return await residenteRepository.save(nuevoResidente);
};

export const updateResidenteService = async (id_residente, data) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };

    if (Object.keys(data).length === 0) return residente;

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
    await residenteRepository.delete(id_residente);
    return true;
};