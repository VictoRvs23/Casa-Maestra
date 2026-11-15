import { AppDataSource } from "../config/configDb.js";
import AgendaEntity from "../entities/agenda.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";
import { notificarNuevosHorarios } from "./notificacion.eventos.js";

const aMin = (hora) => {
    const [h, m] = String(hora).split(":");
    return parseInt(h) * 60 + parseInt(m);
};

export const agregaDisponibilidad = (anteriores, nuevos) =>
    nuevos.some((nuevo) => {
        const ini = aMin(nuevo.hora_inicio);
        const fin = aMin(nuevo.hora_fin);
        const previos = anteriores
            .filter((b) => b.dia_semana === nuevo.dia_semana)
            .map((b) => [aMin(b.hora_inicio), aMin(b.hora_fin)])
            .sort((a, b) => a[0] - b[0]);

        let cursor = ini;
        for (const [pi, pf] of previos) {
            if (pf <= cursor) continue;
            if (pi > cursor) return true;
            cursor = Math.max(cursor, pf);
            if (cursor >= fin) return false;
        }
        return cursor < fin;
    });

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

    const anteriores = await agendaRepository.find({
        where: { estudio: { id_estudio: parseInt(id_estudio) }, activo: true },
    });

    const guardados = await AppDataSource.transaction(async (manager) => {
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

    if (estudio.tipo_arriendo === "por_hora" && agregaDisponibilidad(anteriores, bloques)) {
        notificarNuevosHorarios();
    }

    return guardados;
};