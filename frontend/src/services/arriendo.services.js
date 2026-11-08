import api from "./api";

export const getDisponibilidadArriendos = async () => {
  const { data } = await api.get("/arriendos/disponibilidad");
  return data;
};

export const crearArriendo = async (datos) => {
  const { data } = await api.post("/arriendos", datos);
  return data;
};

export const cancelarArriendo = async (id_arriendo) => {
  const { data } = await api.delete(`/arriendos/${id_arriendo}`);
  return data;
};

export const getMisArriendos = async () => {
  const { data } = await api.get("/arriendos/mios");
  return data;
};

export const getArriendos = async (params) => {
  const { data } = await api.get("/arriendos", { params });
  return data;
};