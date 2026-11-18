import api from "./api";

export const getMisServicios = async () => {
  const { data } = await api.get("/agenda-residente/servicios");
  return data;
};

export const crearServicio = async (formData) => {
  const { data } = await api.post("/agenda-residente/servicios", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const actualizarServicio = async (id_servicio, formData) => {
  const { data } = await api.put(`/agenda-residente/servicios/${id_servicio}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const eliminarServicio = async (id_servicio) => {
  const { data } = await api.delete(`/agenda-residente/servicios/${id_servicio}`);
  return data;
};

export const getMisHorarios = async () => {
  const { data } = await api.get("/agenda-residente/horarios");
  return data;
};

export const guardarMisHorarios = async (bloques) => {
  const { data } = await api.put("/agenda-residente/horarios", { bloques });
  return data;
};

export const getOfertaPublica = async (slug) => {
  const { data } = await api.get(`/agenda-residente/publico/${encodeURIComponent(slug)}`);
  return data;
};
