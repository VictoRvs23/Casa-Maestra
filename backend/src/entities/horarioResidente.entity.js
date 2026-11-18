"use strict";

import { EntitySchema } from "typeorm";

const HorarioResidenteEntity = new EntitySchema({
    name: "HorarioResidente",
    tableName: "horarios_residente",
    columns: {
        id_horario: {
            primary: true,
            type: "int",
            generated: true,
        },
        id_residente: {
            type: "int",
            nullable: false,
        },
        dia_semana: {
            type: "smallint",
            nullable: false,
        },
        hora_inicio: {
            type: "varchar",
            length: 5,
            nullable: false,
        },
        hora_fin: {
            type: "varchar",
            length: 5,
            nullable: false,
        },
    },
    relations: {
        residente: {
            type: "many-to-one",
            target: "Residente",
            joinColumn: { name: "id_residente", referencedColumnName: "id_residente" },
            onDelete: "CASCADE",
        },
    },
});

export default HorarioResidenteEntity;
