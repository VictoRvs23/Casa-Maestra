"use strict";

import { EntitySchema } from "typeorm";

const ReservaEntity = new EntitySchema({
    name: "Reserva",
    tableName: "reservas",
    columns: {
        id_reserva: {
            primary: true,
            type: "int",
            generated: true,
        },
        fecha: {
            type: "date",
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
        estado: {
            type: "varchar",
            length: 20,
            default: "confirmada",
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
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario" },
            nullable: false,
            onDelete: "CASCADE",
        },
    },
});

export default ReservaEntity;