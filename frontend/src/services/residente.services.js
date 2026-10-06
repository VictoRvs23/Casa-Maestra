import api from "./api";

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export const getImagenUrl = (rutaImagen) => {
  if (!rutaImagen) return null;
  if (rutaImagen.startsWith("http")) return rutaImagen;
  return `${SERVER_ORIGIN}${rutaImagen}`;
};

export const getResidentes = async ({ busqueda = "", page = 1, limit = 12 } = {}) => {
  const params = { page, limit };
  if (busqueda) params.busqueda = busqueda;

  const { data } = await api.get("/residentes", { params });
  return data;
};

export const getResidente = async (id_residente) => {
  const { data } = await api.get(`/residentes/${id_residente}`);
  return data;
};

export const createResidente = async (formData) => {
  const { data } = await api.post("/residentes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateResidente = async (id_residente, formData) => {
  const { data } = await api.put(`/residentes/${id_residente}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteResidente = async (id_residente) => {
  const { data } = await api.delete(`/residentes/${id_residente}`);
  return data;
};