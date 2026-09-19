import { AppDataSource } from "../config/configDb.js";
import EstudioEntity from "../entities/estudio.entity.js";
import fs from "fs";
import path from "path";

const estudioRepository = AppDataSource.getRepository(EstudioEntity);

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith("/uploads/estudios/")) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

export const getEstudiosService = async (query = {}) => {
    const { tipo_arriendo, disponible, busqueda, page = 1, limit = 6 } = query;

    const qb = estudioRepository.createQueryBuilder("estudio")
        .orderBy("estudio.id_estudio", "ASC");

    if (tipo_arriendo) {
        qb.andWhere("estudio.tipo_arriendo = :tipo_arriendo", { tipo_arriendo });
    }

    if (disponible !== undefined && disponible !== "") {
        qb.andWhere("estudio.disponible = :disponible", { disponible: disponible === "true" || disponible === true });
    }

    if (busqueda) {
        qb.andWhere("estudio.nombre ILIKE :busqueda", { busqueda: `%${busqueda}%` });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 6;

    qb.skip((pageNum - 1) * limitNum).take(limitNum);

    const [estudios, total] = await qb.getManyAndCount();

    return {
        estudios,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

export const getEstudioService = async (id_estudio) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });

    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };
    return estudio;
};

export const createEstudioService = async (data) => {
    const nuevoEstudio = estudioRepository.create(data);
    return await estudioRepository.save(nuevoEstudio);
};

export const updateEstudioService = async (id_estudio, data) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });

    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };

    if (data.imagen !== undefined && data.imagen !== estudio.imagen) {
        borrarImagenLocal(estudio.imagen);
    }

    await estudioRepository.update(id_estudio, data);
    return await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });
};

export const deleteEstudioService = async (id_estudio) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });

    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };

    borrarImagenLocal(estudio.imagen);
    await estudioRepository.delete(id_estudio);
    return true;
};