import React, { useState } from "react";
import { updateUsuario } from "../../services/usuario.services.js";
import { AiOutlineEdit } from "react-icons/ai";
import "../../styles/perfil/DatosPersonales.css";

export default function DatosPersonales({ perfil, onGuardado }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre_usuario: perfil.nombre_usuario || "",
    nombre: perfil.nombre || "",
    apellido: perfil.apellido || "",
    email: perfil.email || "",
    telefono: perfil.telefono || "",
    fecha_nacimiento: perfil.fecha_nacimiento ? perfil.fecha_nacimiento.slice(0, 10) : "",
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCancelar = () => {
    setForm({
      nombre_usuario: perfil.nombre_usuario || "",
      nombre: perfil.nombre || "",
      apellido: perfil.apellido || "",
      email: perfil.email || "",
      telefono: perfil.telefono || "",
      fecha_nacimiento: perfil.fecha_nacimiento ? perfil.fecha_nacimiento.slice(0, 10) : "",
    });
    setEditando(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { usuario } = await updateUsuario(perfil.id_usuario, form);
      onGuardado(usuario);
      setEditando(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="perfil-content-head">
        <div>
          <h2>Datos Personales</h2>
          <p>Esta información es privada, solo tú puedes verla</p>
        </div>
        {!editando && (
          <button className="icon-edit-btn" onClick={() => setEditando(true)} aria-label="Editar">
            <AiOutlineEdit size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleGuardar}>
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            disabled={!editando}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} disabled={!editando} required />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} disabled={!editando} required />
          </div>
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} disabled={!editando} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} disabled={!editando} />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} disabled={!editando} />
          </div>
        </div>

        {editando && (
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={handleCancelar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}