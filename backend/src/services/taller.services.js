import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import TallerEntity from "../entities/taller.entity.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import fs from "fs";
import path from "path";

const tallerRepository = AppDataSource.getRepository(TallerEntity);
const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

// Roles que pueden aparecer como artistas de un taller.
const ROLES_ARTISTA = ["Artista", "Residente"];

// Solo estos campos del usuario salen en la API pública (nunca contraseña ni email).
const CAMPOS_ARTISTA = [
    "artista.id_usuario",
    "artista.nombre",
    "artista.apellido",
    "artista.nombre_usuario",
    "artista.avatar",
];

// Solo borra archivos que subimos nosotros (por ruta), nunca una URL externa.
const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith("/uploads/talleres/")) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

// Convierte una lista de ids en usuarios reales con rol Artista/Residente.
const resolverArtistas = async (ids) => {
    if (!ids || ids.length === 0) return [];

    const artistas = await usuarioRepository.find({
        where: { id_usuario: In(ids), rol: In(ROLES_ARTISTA) },
    });

    if (artistas.length !== ids.length) {
        throw {
            status: 400,
            message: "Alguno de los artistas seleccionados no existe o no tiene rol de Artista o Residente.",
        };
    }
    return artistas;
};

export const getTalleresService = async () => {
    return await tallerRepository.find({ order: { id_taller: "ASC" } });
};

export const getTallerService = async (id_taller) => {
    const taller = await tallerRepository
        .createQueryBuilder("taller")
        .leftJoin("taller.artistas", "artista")
        .addSelect(CAMPOS_ARTISTA)
        .where("taller.id_taller = :id", { id: parseInt(id_taller) })
        .orderBy("artista.nombre", "ASC")
        .getOne();

    if (!taller) throw { status: 404, message: "Taller no encontrado" };
    return taller;
};

// Lista para el selector del formulario (solo Fundador/a y Admin).
export const getArtistasDisponiblesService = async () => {
    return await usuarioRepository.find({
        where: { rol: In(ROLES_ARTISTA) },
        select: ["id_usuario", "nombre", "apellido", "nombre_usuario", "avatar"],
        order: { nombre: "ASC" },
    });
};

export const createTallerService = async (data) => {
    const { artistas: idsArtistas, ...resto } = data;

    const nuevoTaller = tallerRepository.create(resto);
    nuevoTaller.artistas = await resolverArtistas(idsArtistas);

    const guardado = await tallerRepository.save(nuevoTaller);
    return await getTallerService(guardado.id_taller);
};

export const updateTallerService = async (id_taller, data) => {
    const taller = await tallerRepository.findOne({
        where: { id_taller: parseInt(id_taller) },
        relations: { artistas: true },
    });

    if (!taller) throw { status: 404, message: "Taller no encontrado" };

    const { artistas: idsArtistas, ...resto } = data;
    
    if (resto.imagen !== undefined && resto.imagen !== taller.imagen) {
        borrarImagenLocal(taller.imagen);
    }

    Object.assign(taller, resto);

    if (idsArtistas !== undefined) {
        taller.artistas = await resolverArtistas(idsArtistas);
    }

    await tallerRepository.save(taller);
    return await getTallerService(id_taller);
};

export const deleteTallerService = async (id_taller) => {
    const taller = await tallerRepository.findOneBy({ id_taller: parseInt(id_taller) });

    if (!taller) throw { status: 404, message: "Taller no encontrado" };

    borrarImagenLocal(taller.imagen);
    await tallerRepository.delete(id_taller); // la tabla intermedia se limpia sola (ON DELETE CASCADE)
    return true;
};