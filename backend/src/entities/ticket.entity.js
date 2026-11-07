"use strict";

import { EntitySchema } from "typeorm";

const TicketEntity = new EntitySchema({
    name: "Ticket",
    tableName: "tickets",
    columns: {
        id_ticket: {
            primary: true,
            type: "int",
            generated: true,
        },
        asunto: {
            type: "varchar",
            length: 120,
            nullable: false,
        },
        mensaje: {
            type: "text",
            nullable: false,
        },
        categoria: {
            type: "varchar",
            length: 30,
            nullable: false,
        },
        estado: {
            type: "varchar",
            length: 20,
            default: "Abierto",
        },
        respuesta: {
            type: "text",
            nullable: true,
        },
        respondido_at: {
            type: "timestamp",
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
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario" },
            nullable: true,
            onDelete: "SET NULL",
        },
    },
});

export default TicketEntity;