import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth'; 

export const loginService = async (credenciales) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credenciales);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al iniciar sesión';
  }
};

export const registroService = async (datosUsuario) => {
  try {
    const response = await axios.post(`${API_URL}/registro`, datosUsuario);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al registrar usuario';
  }
};