import { AppDataSource } from "../config/configDb.js";
import PreguntaFrecuenteEntity from "../entities/preguntaFrecuente.entity.js";

const preguntaRepository = AppDataSource.getRepository(PreguntaFrecuenteEntity);

export const getPreguntasService = async ({ categoria } = {}) => {
    const where = categoria ? { categoria } : {};

    return await preguntaRepository.find({
        where,
        order: { orden: "ASC", id_pregunta: "ASC" },
    });
};

export const getPreguntaService = async (id_pregunta) => {
    const pregunta = await preguntaRepository.findOneBy({ id_pregunta: parseInt(id_pregunta) });

    if (!pregunta) throw { status: 404, message: "Pregunta frecuente no encontrada" };
    return pregunta;
};

export const createPreguntaService = async (data) => {
    const nuevaPregunta = preguntaRepository.create(data);
    return await preguntaRepository.save(nuevaPregunta);
};

export const updatePreguntaService = async (id_pregunta, data) => {
    const pregunta = await preguntaRepository.findOneBy({ id_pregunta: parseInt(id_pregunta) });

    if (!pregunta) throw { status: 404, message: "Pregunta frecuente no encontrada" };

    if (Object.keys(data).length === 0) return pregunta;

    await preguntaRepository.update(id_pregunta, data);
    return await preguntaRepository.findOneBy({ id_pregunta: parseInt(id_pregunta) });
};

export const deletePreguntaService = async (id_pregunta) => {
    const pregunta = await preguntaRepository.findOneBy({ id_pregunta: parseInt(id_pregunta) });

    if (!pregunta) throw { status: 404, message: "Pregunta frecuente no encontrada" };

    await preguntaRepository.delete(id_pregunta);
    return true;
};