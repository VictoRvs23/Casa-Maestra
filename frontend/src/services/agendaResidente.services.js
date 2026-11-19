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

export const getDisponibilidad = async (slug, id_servicio) => {
  const { data } = await api.get(`/agenda-residente/publico/${encodeURIComponent(slug)}/disponibilidad`, {
    params: { id_servicio },
  });
  return data;
};

export const crearCita = async (payload) => {
  const { data } = await api.post("/agenda-residente/citas", payload);
  return data;
};

export const getMisCitas = async () => {
  const { data } = await api.get("/agenda-residente/citas/mias");
  return data;
};

export const cancelarCita = async (id_cita) => {
  const { data } = await api.patch(`/agenda-residente/citas/${id_cita}/cancelar`);
  return data;
};

export const getCitasResidente = async () => {
  const { data } = await api.get("/agenda-residente/citas");
  return data;
};

export const responderCita = async (id_cita, accion) => {
  const { data } = await api.patch(`/agenda-residente/citas/${id_cita}/responder`, { accion });
  return data;
};