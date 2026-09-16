"use strict";

import { EntitySchema } from "typeorm";

const EstudioEntity = new EntitySchema({
    name: "Estudio",
    tableName: "estudios",
    columns: {
        id_estudio: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        tipo_arriendo: {
            type: "varchar",
            length: 20,
            nullable: false,
            default: "mensual",
        },
        capacidad: {
            type: "int",
            nullable: false,
        },
        ancho_metros: {
            type: "decimal",
            precision: 5,
            scale: 2,
            nullable: false,
        },
        largo_metros: {
            type: "decimal",
            precision: 5,
            scale: 2,
            nullable: false,
        },
        precio: {
            type: "int",
            nullable: false,
        },
        imagen: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        disponible: {
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
});

export default EstudioEntity;