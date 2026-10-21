import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const { alerta } = useAlerta();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/"); 
    } catch (err) {
      alerta(typeof err === "string" ? err : "No se pudo iniciar sesión.", {
        tipo: "error",
        titulo: "No pudimos iniciar sesión",
      });
    }
  };

  return (
    <AuthLayout>
      <div className="login-content">
        <h1 className="login-title">Bienvenido de Vuelta</h1>
        <p className="login-subtitle">
          Ingresa para agendar hora con tus artistas favoritos, revisar talleres y más
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              id="email"
              type="email" 
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="login-btn">
            Iniciar Sesión
          </button>

        </form>

        <p className="register-prompt">
          ¿Primera vez en Casa Maestra? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;