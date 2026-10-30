"use strict";

import { EntitySchema } from "typeorm";

const PaginaResidenteEntity = new EntitySchema({
    name: "PaginaResidente",
    tableName: "paginas_residente",
    columns: {
        id_pagina: {
            primary: true,
            type: "int",
            generated: true,
        },
        id_residente: {
            type: "int",
            nullable: false,
        },
        publicada: {
            type: "boolean",
            default: false,
        },
        color_acento: {
            type: "varchar",
            length: 7,
            default: "#845736",
        },
        color_fondo: {
            type: "varchar",
            length: 7,
            default: "#f6f1e8",
        },
        fuente: {
            type: "varchar",
            length: 20,
            default: "elegante",
        },
        portada: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        bloques: {
            type: "jsonb",
            default: () => "'[]'::jsonb",
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
        residente: {
            type: "one-to-one",
            target: "Residente",
            joinColumn: { name: "id_residente", referencedColumnName: "id_residente" },
            onDelete: "CASCADE",
        },
    },
});

export default PaginaResidenteEntity;
