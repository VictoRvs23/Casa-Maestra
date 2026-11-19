"use strict";

import { EntitySchema } from "typeorm";

const ServicioResidenteEntity = new EntitySchema({
    name: "ServicioResidente",
    tableName: "servicios_residente",
    columns: {
        id_servicio: {
            primary: true,
            type: "int",
            generated: true,
        },
        id_residente: {
            type: "int",
            nullable: false,
        },
        tipo: {
            type: "varchar",
            length: 10,
            nullable: false,
            default: "servicio",
        },
        nombre: {
            type: "varchar",
            length: 80,
            nullable: false,
        },
        descripcion: {
            type: "varchar",
            length: 500,
            nullable: true,
        },
        precio: {
            type: "int",
            nullable: true,
        },
        duracion_min: {
            type: "int",
            nullable: true,
        },
        imagen: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        activo: {
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
    relations: {
        residente: {
            type: "many-to-one",
            target: "Residente",
            joinColumn: { name: "id_residente", referencedColumnName: "id_residente" },
            onDelete: "CASCADE",
        },
    },
});

export default ServicioResidenteEntity;
