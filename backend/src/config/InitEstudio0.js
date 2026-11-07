"use strict";
import { AppDataSource } from "./configDb.js";
import EstudioEntity from "../entities/estudio.entity.js";
import AgendaEntity from "../entities/agenda.entity.js";

export async function createEstudio0() {
    const estudioRepository = AppDataSource.getRepository(EstudioEntity);
    const agendaRepository = AppDataSource.getRepository(AgendaEntity);

    const existente = await estudioRepository.findOneBy({ tipo_arriendo: "por_hora" });
    if (existente) {
        console.log("=> Estudio 0 ya existente en la base de datos.");
        return existente;
    }

    const estudio = await estudioRepository.save(
        estudioRepository.create({
            nombre: "Estudio 0",
            descripcion: "Sala equipada para tu oficio, disponible por hora.",
            tipo_arriendo: "por_hora",
            capacidad: 5,
            ancho_metros: 4,
            largo_metros: 6,
            precio: 10000,
            disponible: true,
        })
    );

    const bloques = [1, 2, 3, 4, 5, 6].map((dia_semana) =>
        agendaRepository.create({
            dia_semana,
            hora_inicio: "10:00",
            hora_fin: "19:00",
            activo: true,
            estudio: { id_estudio: estudio.id_estudio },
        })
    );
    await agendaRepository.save(bloques);

    console.log("=> Estudio 0 creado con su horario inicial.");
    return estudio;
}