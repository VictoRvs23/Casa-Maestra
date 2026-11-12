"use strict";

import { EntitySchema } from "typeorm";

const ArriendoEntity = new EntitySchema({
    name: "Arriendo",
    tableName: "arriendos",
    columns: {
        id_arriendo: {
            primary: true,
            type: "int",
            generated: true,
        },
        mes_inicio: {
            type: "date",
            nullable: false,
        },
        meses: {
            type: "int",
            nullable: false,
        },
        fecha_inicio: {
            type: "date",
            nullable: false,
        },
        fecha_fin: {
            type: "date",
            nullable: false,
        },
        total: {
            type: "int",
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

export default ArriendoEntity;