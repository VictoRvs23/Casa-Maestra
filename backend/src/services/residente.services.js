import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import PaginaResidenteEntity from "../entities/paginaResidente.entity.js";
import { limpiarImagenesDeResidenteService } from "./pagina.services.js";
import { cambiosPorNombre, esVisible } from "./tarjeta.services.js";
import fs from "fs";
import path from "path";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const paginaRepository = AppDataSource.getRepository(PaginaResidenteEntity);

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith("/uploads/residentes/")) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

const conDatosDePagina = async (residentes) => {
    if (residentes.length === 0) return [];

    const paginas = await paginaRepository.find({
        where: { id_residente: In(residentes.map((r) => r.id_residente)) },
        select: { id_residente: true, publicada: true, foto: true },
    });
    const porId = new Map(paginas.map((p) => [p.id_residente, p]));

    return residentes.map((r) => {
        const pagina = porId.get(r.id_residente);
        const { slugs_anteriores, ...publico } = r;
        return {
            ...publico,
            publicada: Boolean(pagina?.publicada),
            imagen: pagina?.foto || r.imagen || null,
        };
    });
};

export const getResidentesService = async (query = {}, { esStaff = false } = {}) => {
    const { busqueda, page = 1, limit = 12, todas } = query;
    const verTodas = esStaff && (todas === "1" || todas === "true");

    const qb = residenteRepository.createQueryBuilder("residente").orderBy("residente.id_residente", "ASC");

    if (!verTodas) {
        qb.innerJoin(PaginaResidenteEntity, "p", "p.id_residente = residente.id_residente")
            .andWhere("residente.activa = true")
            .andWhere("p.publicada = true");
    }

    if (busqueda) {
        qb.andWhere("(residente.nombre ILIKE :busqueda OR residente.descripcion ILIKE :busqueda)", {
            busqueda: `%${busqueda}%`,
        });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;

    qb.skip((pageNum - 1) * limitNum).take(limitNum);

    const [residentes, total] = await qb.getManyAndCount();

    return {
        residentes: await conDatosDePagina(residentes),
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

export const getResidenteService = async (id_residente, { esStaff = false } = {}) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente || (!esStaff && !(await esVisible(residente)))) {
        throw { status: 404, message: "Residente no encontrado" };
    }
    return (await conDatosDePagina([residente]))[0];
};

export const updateResidenteService = async (id_residente, data) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };

    const cambios = {};

    if (data.nombre !== undefined) Object.assign(cambios, await cambiosPorNombre(residente, data.nombre));
    if (data.descripcion !== undefined) cambios.descripcion = data.descripcion || null;
    if (data.activa !== undefined) cambios.activa = Boolean(data.activa);

    if (Object.keys(cambios).length > 0) await residenteRepository.update(residente.id_residente, cambios);

    return (await conDatosDePagina([await residenteRepository.findOneBy({ id_residente: residente.id_residente })]))[0];
};

export const deleteResidenteService = async (id_residente) => {
    const residente = await residenteRepository.findOneBy({ id_residente: parseInt(id_residente) });

    if (!residente) throw { status: 404, message: "Residente no encontrado" };

    borrarImagenLocal(residente.imagen);
    await limpiarImagenesDeResidenteService(residente.id_residente);
    await residenteRepository.delete(id_residente);
    return true;
};