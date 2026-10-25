import api from "./api";

export const getPreguntas = async ({ categoria = "" } = {}) => {
  const params = {};
  if (categoria) params.categoria = categoria;

  const { data } = await api.get("/preguntas-frecuentes", { params });
  return data;
};

export const createPregunta = async (data) => {
  const { data: res } = await api.post("/preguntas-frecuentes", data);
  return res;
};

export const updatePregunta = async (id_pregunta, data) => {
  const { data: res } = await api.put(`/preguntas-frecuentes/${id_pregunta}`, data);
  return res;
};

export const deletePregunta = async (id_pregunta) => {
  const { data } = await api.delete(`/preguntas-frecuentes/${id_pregunta}`);
  return data;
};