import api from "./api";

export const getSwitches = async () => {
  const { data } = await api.get("/switch-modulos");
  return data;
};

export const setTalleresHabilitado = async (habilitado) => {
  const { data } = await api.put("/switch-modulos/talleres", { habilitado });
  return data;
};
 