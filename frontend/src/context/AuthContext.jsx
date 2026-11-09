import React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { loginService } from "../services/auth.services";

const limpiarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    try {
      if (token && savedUser && savedUser !== "undefined") {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error al leer el usuario guardado:", error);
      limpiarSesion();
    }

    setLoading(false);
}, []);

  const login = async (email, password, recordarme = false) => {
    const data = await loginService({ email, contraseña: password });
    limpiarSesion();
    const almacen = recordarme ? localStorage : sessionStorage;
    almacen.setItem("token", data.token);
    almacen.setItem("user", JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    limpiarSesion();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);