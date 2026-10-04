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

export default ResidenteEntity;