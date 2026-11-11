import { AppDataSource } from "../config/configDb.js";
import SeguimientoEntity from "../entities/seguimiento.entity.js";
import ResidenteEntity from "../entities/residente.entity.js";

const seguimientoRepository = AppDataSource.getRepository(SeguimientoEntity);
const residenteRepository = AppDataSource.getRepository(ResidenteEntity);

const contarSeguidores = (id_residente) =>
    seguimientoRepository.count({ where: { residente: { id_residente } } });

const buscarSeguimiento = (id_usuario, id_residente) =>
    seguimientoRepository.findOne({
        where: { usuario: { id_usuario }, residente: { id_residente } },
    });
    
export const getResumenSeguidoresService = async (slug) => {
    const residente = await residenteRepository.findOneBy({ slug });
    if (!residente) throw { status: 404, message: "No encontramos a este residente." };

    return {
        id_residente: residente.id_residente,
        seguidores: await contarSeguidores(residente.id_residente),
    };
};

export const seguirResidenteService = async (id_usuario, id_residente) => {
    const residente = await residenteRepository.findOneBy({ id_residente });
    if (!residente) throw { status: 404, message: "No encontramos a este residente." };

    if (residente.id_usuario === id_usuario) {
        throw { status: 400, message: "No puedes seguir tu propia página." };
    }

    if (await buscarSeguimiento(id_usuario, id_residente)) {
        throw { status: 409, message: "Ya sigues a este residente." };
    }

    try {
        await seguimientoRepository.save(
            seguimientoRepository.create({ usuario: { id_usuario }, residente: { id_residente } })
        );
    } catch (error) {
        if (error.code === "23505") throw { status: 409, message: "Ya sigues a este residente." };
        throw error;
    }

    return { id_residente, siguiendo: true, seguidores: await contarSeguidores(id_residente) };
};

export const dejarDeSeguirResidenteService = async (id_usuario, id_residente) => {
    const seguimiento = await buscarSeguimiento(id_usuario, id_residente);
    if (!seguimiento) throw { status: 404, message: "No sigues a este residente." };

    await seguimientoRepository.remove(seguimiento);

    return { id_residente, siguiendo: false, seguidores: await contarSeguidores(id_residente) };
};

export const getMisSeguidosService = async (id_usuario) => {
    const seguimientos = await seguimientoRepository.find({
        where: { usuario: { id_usuario } },
        relations: { residente: true },
        order: { created_at: "DESC" },
    });

    return seguimientos.map((s) => ({
        id_seguimiento: s.id_seguimiento,
        desde: s.created_at,
        residente: {
            id_residente: s.residente.id_residente,
            nombre: s.residente.nombre,
            descripcion: s.residente.descripcion,
            imagen: s.residente.imagen,
            slug: s.residente.slug,
        },
    }));
};