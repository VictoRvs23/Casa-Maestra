import api from "./api";

export { getImagenUrl } from "./residente.services.js";


export const getMiPagina = async () => {
  const { data } = await api.get("/mi-pagina");
  return data;
};

export const updateMiPagina = async (cambios) => {
  const { data } = await api.put("/mi-pagina", cambios);
  return data;
};

export const subirImagenPagina = async (archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const { data } = await api.post("/mi-pagina/imagenes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};


export const getPaginaPublica = async (slug) => {
  const { data } = await api.get(`/paginas/${encodeURIComponent(slug)}`);
  return data;
};
