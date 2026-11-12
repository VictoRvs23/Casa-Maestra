import api from "./api";

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export const getImagenUrl = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("http")) return ruta;
  return `${SERVER_ORIGIN}${ruta}`;
};

export const getEstudio0 = async () => {
  const { data } = await api.get("/estudio0");
  return data;
};

export const getDisponibilidad = async (mes) => {
  const { data } = await api.get("/estudio0/disponibilidad", { params: { mes } });
  return data;
};

export const reservarEstudio0 = async (payload) => {
  const { data } = await api.post("/estudio0/reservas", payload);
  return data;
};

export const editarEstudio0 = async (id_estudio, formData) => {
  const { data } = await api.put(`/estudios/${id_estudio}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getAgenda = async (id_estudio) => {
  const { data } = await api.get(`/estudios/${id_estudio}/agenda`);
  return data;
};

export const updateAgenda = async (id_estudio, bloques) => {
  const { data } = await api.put(`/estudios/${id_estudio}/agenda`, { bloques });
  return data;
};

export const getReservas = async (params) => {
  const { data } = await api.get("/reservas", { params });
  return data;
};

export const getMisReservas = async () => {
  const { data } = await api.get("/reservas/mias");
  return data;
};

export const cancelarReserva = async (id_reserva) => {
  const { data } = await api.delete(`/reservas/${id_reserva}`);
  return data;
};

export const hoyEnChile = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());