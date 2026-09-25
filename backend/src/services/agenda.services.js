import { AppDataSource } from "../config/configDb.js";
import AgendaEntity from "../entities/agenda.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";

const agendaRepository = AppDataSource.getRepository(AgendaEntity);
const estudioRepository = AppDataSource.getRepository(EstudioEntity);

export const getAgendaService = async (id_estudio) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });
    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };

    const bloques = await agendaRepository.find({
        where: { estudio: { id_estudio: parseInt(id_estudio) }, activo: true },
        order: { dia_semana: "ASC", hora_inicio: "ASC" },
    });

    return bloques;
};

export const reemplazarSemanaAgendaService = async (id_estudio, bloques) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });
    if (!estudio) throw { status: 404, message: "Estudio no encontrado" };

    return await AppDataSource.transaction(async (manager) => {
        const repo = manager.getRepository(AgendaEntity);

        await repo.delete({ estudio: { id_estudio: parseInt(id_estudio) } });

        if (bloques.length === 0) return [];

        const nuevosBloques = bloques.map((b) =>
            repo.create({
                ...b,
                estudio: { id_estudio: parseInt(id_estudio) },
            })
        );

        return await repo.save(nuevosBloques);
    });
};