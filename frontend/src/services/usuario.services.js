import api from "./api";

export const getUsuarios = async ({ rol = "", busqueda = "", page = 1, limit = 6 } = {}) => {
  const params = {};
  if (rol) params.rol = rol;
  if (busqueda) params.busqueda = busqueda;
  params.page = page;
  params.limit = limit;

  const { data } = await api.get("/usuarios", { params });
  return data;
};

export const getUsuario = async (id_usuario) => {
  const { data } = await api.get(`/usuarios/${id_usuario}`);
  return data;
};

export const updateUsuario = async (id_usuario, payload) => {
  const { data } = await api.put(`/usuarios/${id_usuario}`, payload);
  return data;
};

export const cambiarContrasena = async (id_usuario, contraseña_actual, contraseña_nueva) => {
  const { data } = await api.put(`/usuarios/${id_usuario}/contrasena`, {
    contraseña_actual,
    contraseña_nueva,
  });
  return data;
};

export const deleteUsuario = async (id_usuario) => {
  const { data } = await api.delete(`/usuarios/${id_usuario}`);
  return data;
};