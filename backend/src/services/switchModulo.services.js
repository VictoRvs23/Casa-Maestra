import { AppDataSource } from "../config/configDb.js";
import SwitchModuloEntity from "../entities/switchModulo.entity.js";

const switchModuloRepository = AppDataSource.getRepository(SwitchModuloEntity);

const CLAVE_TALLERES = "talleres_habilitado";

export const getTalleresHabilitadoService = async () => {
    const fila = await switchModuloRepository.findOneBy({ clave: CLAVE_TALLERES });
    return fila ? fila.valor !== false : true;
};

export const setTalleresHabilitadoService = async (habilitado) => {
    await switchModuloRepository.save({ clave: CLAVE_TALLERES, valor: Boolean(habilitado) });
    return Boolean(habilitado);
};

export const getSwitchesPublicosService = async () => ({
    talleres_habilitado: await getTalleresHabilitadoService(),
});
