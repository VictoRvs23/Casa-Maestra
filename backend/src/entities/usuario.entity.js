"use strict"

import { EntitySchema } from "typeorm";

const UsuarioEntity = new EntitySchema({
    name: "Usuario",
    tableName: "usuarios",
    columns: {
        id_usuario: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre_usuario: {
            type: "varchar",
            length: 50,
            nullable:false,
            unique: true
        },
        nombre: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        apellido: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 200,
            unique: true,
            nullable: false,
        },
        contraseña: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        telefono: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        fecha_nacimiento: {
            type: "date",
            nullable: true,
        },
        avatar: {
            type: "varchar",
            length: 200,
            nullable: true,
        },
        rol: {
            type: "varchar",
            length: 20,
            nullable: false,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
        }
    }
});
export default UsuarioEntity;