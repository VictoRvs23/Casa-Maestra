import api from "./api";

export const getMisSeguidos = async () => {
  const { data } = await api.get("/seguidos");
  return data;
};

export const getResumenSeguidores = async (slug) => {
  const { data } = await api.get(`/seguidos/residente/${slug}`);
  return data;
};

export const seguirResidente = async (id_residente) => {
  const { data } = await api.post(`/seguidos/${id_residente}`);
  return data;
};

export const dejarDeSeguirResidente = async (id_residente) => {
  const { data } = await api.delete(`/seguidos/${id_residente}`);
  return data;
};