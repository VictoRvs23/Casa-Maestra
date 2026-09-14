import api from "./api";

export const loginService = async (credenciales) => {
  try {
    const response = await api.post("/auth/login", credenciales);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error al iniciar sesión";
  }
};

export const registroService = async (datosUsuario) => {
  try {
    const response = await api.post("/auth/registro", datosUsuario);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error al registrar usuario";
  }
};