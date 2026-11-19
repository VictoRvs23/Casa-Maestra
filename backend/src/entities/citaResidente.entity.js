"use strict";

import { EntitySchema } from "typeorm";

const CitaResidenteEntity = new EntitySchema({
    name: "CitaResidente",
    tableName: "citas_residente",
    columns: {
        id_cita: {
            primary: true,
            type: "int",
            generated: true,
        },
        id_residente: {
            type: "int",
            nullable: false,
        },
        id_servicio: {
            type: "int",
            nullable: true,
        },
        id_usuario: {
            type: "int",
            nullable: true,
        },
        tipo: {
            type: "varchar",
            length: 10,
            nullable: false,
            default: "servicio",
        },
        nombre_servicio: {
            type: "varchar",
            length: 80,
            nullable: false,
        },
        precio: {
            type: "int",
            nullable: true,
        },
        duracion_min: {
            type: "int",
            nullable: true,
        },
        fecha: {
            type: "varchar",
            length: 10,
            nullable: true,
        },
        hora_inicio: {
            type: "varchar",
            length: 5,
            nullable: true,
        },
        hora_fin: {
            type: "varchar",
            length: 5,
            nullable: true,
        },
        nota: {
            type: "varchar",
            length: 300,
            nullable: true,
        },
        estado: {
            type: "varchar",
            length: 12,
            nullable: false,
            default: "pendiente",
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
            type: "many-to-one",
            target: "Residente",
            joinColumn: { name: "id_residente", referencedColumnName: "id_residente" },
            onDelete: "CASCADE",
        },
        servicio: {
            type: "many-to-one",
            target: "ServicioResidente",
            joinColumn: { name: "id_servicio", referencedColumnName: "id_servicio" },
            nullable: true,
            onDelete: "SET NULL",
        },
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario", referencedColumnName: "id_usuario" },
            nullable: true,
            onDelete: "SET NULL",
        },
    },
});

export default CitaResidenteEntity;
