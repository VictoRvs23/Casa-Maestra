import api from "./api";

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export const getImagenUrl = (rutaImagen) => {
  if (!rutaImagen) return null;
  if (rutaImagen.startsWith("http")) return rutaImagen;
  return `${SERVER_ORIGIN}${rutaImagen}`;
};

export const getEstudios = async ({ tipo_arriendo = "", capacidad = "", busqueda = "", page = 1, limit = 12 } = {}) => {
  const params = { page, limit };
  if (tipo_arriendo) params.tipo_arriendo = tipo_arriendo;
  if (busqueda) params.busqueda = busqueda;

  const { data } = await api.get("/estudios", { params });

  if (capacidad) {
    data.estudios = data.estudios.filter((e) => e.capacidad >= Number(capacidad));
  }

  return data;
};

export const getEstudio = async (id_estudio) => {
  const { data } = await api.get(`/estudios/${id_estudio}`);
  return data;
};

export const createEstudio = async (formData) => {
  const { data } = await api.post("/estudios", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateEstudio = async (id_estudio, formData) => {
  const { data } = await api.put(`/estudios/${id_estudio}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteEstudio = async (id_estudio) => {
  const { data } = await api.delete(`/estudios/${id_estudio}`);
  return data;
};

export const getDisponibilidad = async (id_estudio) => {
  const { data } = await api.get(`/estudios/${id_estudio}/disponibilidad`);
  return data;
};

export const updateDisponibilidad = async (id_estudio, bloques) => {
  const { data } = await api.put(`/estudios/${id_estudio}/disponibilidad`, { bloques });
  return data;
};