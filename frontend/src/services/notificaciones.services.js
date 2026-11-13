import api from "./api";

export const getMisNotificaciones = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await api.get("/notificaciones", { params: { page, limit } });
  return data;
};

export const getContadorNotificaciones = async () => {
  const { data } = await api.get("/notificaciones/contador");
  return data;
};

export const marcarNotificacionLeida = async (id_notificacion) => {
  const { data } = await api.patch(`/notificaciones/${id_notificacion}/leida`);
  return data;
};

export const marcarTodasLeidas = async () => {
  const { data } = await api.patch("/notificaciones/leidas");
  return data;
};

export const eliminarNotificacion = async (id_notificacion) => {
  const { data } = await api.delete(`/notificaciones/${id_notificacion}`);
  return data;
};