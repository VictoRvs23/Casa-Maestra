"use strict";

import { EntitySchema } from "typeorm";

const TallerEntity = new EntitySchema({
    name: "Taller",
    tableName: "talleres",
    columns: {
        id_taller: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 80,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        imagen: {
            type: "varchar",
            length: 255,
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
        artistas: {
            type: "many-to-many",
            target: "Usuario",
            joinTable: {
                name: "taller_artistas",
                joinColumn: { name: "id_taller", referencedColumnName: "id_taller" },
                inverseJoinColumn: { name: "id_usuario", referencedColumnName: "id_usuario" },
            },
        },
    },
});

export default TallerEntity;