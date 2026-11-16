"use strict";

import { EntitySchema } from "typeorm";

const SwitchModuloEntity = new EntitySchema({
    name: "SwitchModulo",
    tableName: "switch_modulos",
    columns: {
        clave: {
            primary: true,
            type: "varchar",
            length: 60,
        },
        valor: {
            type: "jsonb",
            nullable: false,
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
        },
    },
});

export default SwitchModuloEntity;
