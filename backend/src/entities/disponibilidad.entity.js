"use strict";

import { EntitySchema } from "typeorm";

const DisponibilidadEntity = new EntitySchema({
    name: "Disponibilidad",
    tableName: "disponibilidades",
    columns: {
        id_disponibilidad: {
            primary: true,
            type: "int",
            generated: true,
        },
        dia_semana: {
            type: "int",
            nullable: false,
        },
        hora_inicio: {
            type: "time",
            nullable: false,
        },
        hora_fin: {
            type: "time",
            nullable: false,
        },
        activo: {
            type: "boolean",
            default: true,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
        },
    },
    relations: {
        estudio: {
            type: "many-to-one",
            target: "Estudio",
            joinColumn: { name: "id_estudio" },
            nullable: false,
            onDelete: "CASCADE",
        },
    },
});

export default DisponibilidadEntity;