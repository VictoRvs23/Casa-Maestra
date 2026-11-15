"use strict";

import { EntitySchema } from "typeorm";

const SeguimientoEntity = new EntitySchema({
    name: "Seguimiento",
    tableName: "seguimientos",
    columns: {
        id_seguimiento: {
            primary: true,
            type: "int",
            generated: true,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        },
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario" },
            nullable: false,
            onDelete: "CASCADE",
        },
        residente: {
            type: "many-to-one",
            target: "Residente",
            joinColumn: { name: "id_residente" },
            nullable: false,
            onDelete: "CASCADE",
        },
    },
    uniques: [{ name: "UQ_seguimiento_usuario_residente", columns: ["usuario", "residente"] }],
});

export default SeguimientoEntity;