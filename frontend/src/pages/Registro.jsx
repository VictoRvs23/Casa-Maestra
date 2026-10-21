import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/Registro.css";
import { registroService } from "../services/auth.services";
import { useAlerta } from "../context/AlertaContext.jsx";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    contraseña: "",
    confirmar_contraseña: ""
  });
  const navigate = useNavigate();
  const { alerta } = useAlerta();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (formData.contraseña !== formData.confirmar_contraseña) {
      alerta("Las contraseñas no coinciden.", { tipo: "advertencia" });
      return;
    }

    const { confirmar_contraseña, ...payload } = formData;

    try {
      await registroService(payload);
      await alerta("¡Registro exitoso! Ahora puedes iniciar sesión.", {
        tipo: "exito",
        titulo: "Cuenta creada",
      });
      navigate("/login");
    } catch (err) {
      alerta(typeof err === "string" ? err : "No se pudo crear la cuenta.", {
        tipo: "error",
        titulo: "No pudimos crear tu cuenta",
      });
    }
  };

  return (
    <AuthLayout>
      <div className="registro-content">
        <h1 className="registro-title">Únete a Nosotros</h1>
        <p className="registro-subtitle">
          Crea tu cuenta para agendar sesiones, talleres u ofrecer tu oficio como residente o artista
        </p>

        <form className="registro-form" onSubmit={handleRegistro}>

          <div className="form-group">
            <label htmlFor="nombre_usuario">Nombre de usuario</label>
            <input
              id="nombre_usuario"
              name="nombre_usuario"
              type="text"
              placeholder="Nombre de Usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="912345678"
                maxLength={9}
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contraseña">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  placeholder="Mínimo 8 Caracteres"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmar_contraseña">Confirmar contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmar_contraseña"
                  name="confirmar_contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmar_contraseña}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="registro-btn">
            Crear cuenta
          </button>

        </form>

        <p className="login-prompt">
          ¿Ya eres parte de Casa Maestra? <a href="/login">Inicia Sesión</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Registro;