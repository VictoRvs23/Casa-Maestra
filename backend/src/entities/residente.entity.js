"use strict";

import { EntitySchema } from "typeorm";

const ResidenteEntity = new EntitySchema({
    name: "Residente",
    tableName: "residentes",
    columns: {
        id_residente: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 80,
            nullable: false,
        },
        slug: {
            type: "varchar",
            length: 100,
            nullable: false,
            unique: true,
        },
        descripcion: {
            type: "varchar",
            length: 150,
            nullable: true,
        },
        imagen: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        id_usuario: {
            type: "int",
            nullable: true,
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
        usuario: {
            type: "one-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario", referencedColumnName: "id_usuario" },
            nullable: true,
            onDelete: "SET NULL",
        },
    },
});

export default ResidenteEntity;
