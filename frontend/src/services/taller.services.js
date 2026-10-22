import api from "./api";

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export const getImagenUrl = (rutaImagen) => {
  if (!rutaImagen) return null;
  if (rutaImagen.startsWith("http")) return rutaImagen;
  return `${SERVER_ORIGIN}${rutaImagen}`;
};

export const getTalleres = async () => {
  const { data } = await api.get("/talleres");
  return data;
};

export const getTaller = async (id_taller) => {
  const { data } = await api.get(`/talleres/${id_taller}`);
  return data;
};

export const getArtistasDisponibles = async () => {
  const { data } = await api.get("/talleres/artistas-disponibles");
  return data;
};

export const createTaller = async (formData) => {
  const { data } = await api.post("/talleres", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateTaller = async (id_taller, formData) => {
  const { data } = await api.put(`/talleres/${id_taller}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteTaller = async (id_taller) => {
  const { data } = await api.delete(`/talleres/${id_taller}`);
  return data;
};