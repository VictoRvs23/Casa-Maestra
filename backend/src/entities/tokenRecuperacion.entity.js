"use strict";
import { EntitySchema } from "typeorm";

const TokenRecuperacionEntity = new EntitySchema({
    name: "TokenRecuperacion",
    tableName: "tokens_recuperacion",
    columns: {
        id_token: { primary: true, type: "int", generated: true },
        id_usuario: { type: "int", nullable: false },
        token_hash: { type: "varchar", length: 64, nullable: false, unique: true },
        expira_en: { type: "timestamp", nullable: false },
        usado: { type: "boolean", default: false },
        created_at: { type: "timestamp", createDate: true },
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: { name: "id_usuario" },
            onDelete: "CASCADE",
        },
    },
});
export default TokenRecuperacionEntity;