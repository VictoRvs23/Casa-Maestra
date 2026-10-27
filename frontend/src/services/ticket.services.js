import api from "./api";

export const createTicket = async (data) => {
  const { data: res } = await api.post("/tickets", data);
  return res;
};

export const getMisTickets = async () => {
  const { data } = await api.get("/tickets/mis-tickets");
  return data
};

export const getTickets = async ({ estado = "", categoria = "", busqueda = "", page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (estado) params.estado = estado;
  if (categoria) params.categoria = categoria;
  if (busqueda) params.busqueda = busqueda;

  const { data } = await api.get("/tickets", { params });
  return data;
};

export const updateTicket = async (id_ticket, data) => {
  const { data: res } = await api.put(`/tickets/${id_ticket}`, data);
  return res;
};