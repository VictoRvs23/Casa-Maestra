import { AppDataSource } from "../config/configDb.js";
import EstudioEntity from "../entities/estudio.entity.js";

const estudioRepository = AppDataSource.getRepository(EstudioEntity);

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

    await estudioRepository.update(id_estudio, data);
    return await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });
};

export const deleteEstudioService = async (id_estudio) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });

    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };

    await estudioRepository.delete(id_estudio);
    return true;
};