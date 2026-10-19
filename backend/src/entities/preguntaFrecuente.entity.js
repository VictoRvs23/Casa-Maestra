"use strict";

import { EntitySchema } from "typeorm";

const PreguntaFrecuenteEntity = new EntitySchema({
    name: "PreguntaFrecuente",
    tableName: "preguntas_frecuentes",
    columns: {
        id_pregunta: {
            primary: true,
            type: "int",
            generated: true,
        },
        pregunta: {
            type: "varchar",
            length: 200,
            nullable: false,
        },
        respuesta: {
            type: "text",
            nullable: false,
        },
        categoria: {
            type: "varchar",
            length: 30,
            nullable: false,
        },
        orden: {
            type: "int",
            default: 0,
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

export default PreguntaFrecuenteEntity;