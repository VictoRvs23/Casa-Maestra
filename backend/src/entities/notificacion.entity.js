"use strict";

import { EntitySchema } from "typeorm";

const NotificacionEntity = new EntitySchema({
    name: "Notificacion",
    tableName: "notificaciones",
    columns: {
        id_notificacion: {
            primary: true,
            type: "int",
            generated: true,
        },
        tipo: {
            type: "varchar",
            length: 40,
            nullable: false,
        },
        titulo: {
            type: "varchar",
            length: 120,
            nullable: false,
        },
        mensaje: {
            type: "varchar",
            length: 300,
            nullable: false,
        },
        enlace: {
            type: "varchar",
            length: 200,
            nullable: true,
        },
        leida: {
            type: "boolean",
            default: false,
        },
        clave: {
            type: "varchar",
            length: 80,
            nullable: true,
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
    },
    indices: [{ name: "IDX_notificacion_usuario_leida", columns: ["usuario", "leida"] }],
    uniques: [{ name: "UQ_notificacion_usuario_clave", columns: ["usuario", "clave"] }],
});

export default NotificacionEntity;
