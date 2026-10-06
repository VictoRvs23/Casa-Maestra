import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import {
  getResidentes,
  createResidente,
  updateResidente,
  deleteResidente,
  getImagenUrl,
} from "../services/residente.services.js";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import "../styles/Residente.css";

const FORM_INICIAL = { nombre: "", descripcion: "" };

export default function Residente() {
  const { user } = useAuth();
  const puedeGestionar = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const fetchResidentes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResidentes({ limit: 50 });
      setResidentes(data.residentes);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los residentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidentes();
  }, [fetchResidentes]);

  const abrirCrear = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (residente) => {
    setEditandoId(residente.id_residente);
    setForm({
      nombre: residente.nombre,
      descripcion: residente.descripcion || "",
    });
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setImagenArchivo(null);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagenArchivo(file);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    if (imagenArchivo) {
      formData.append("imagen", imagenArchivo);
    }

    try {
      if (editandoId) {
        await updateResidente(editandoId, formData);
      } else {
        await createResidente(formData);
      }
      cerrarModal();
      fetchResidentes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo guardar el residente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (residente) => {
    const ok = window.confirm(`¿Eliminar a "${residente.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteResidente(residente.id_residente);
      fetchResidentes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo eliminar el residente.");
    }
  };

  return (
    <div className="residentes-page">
      <Navbar />

      <div className="residentes-hero">
        <h1>Residentes</h1>
        <p>Conoce a los artistas que trabajan con nosotros</p>
      </div>

      <div className="residentes-wrap">
        {puedeGestionar && (
          <div className="residentes-toolbar">
            <button className="residentes-create-btn" onClick={abrirCrear}>
              + Crear residente
            </button>
          </div>
        )}

        {loading && <p className="estado-msg">Cargando residentes...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && residentes.length === 0 && (
          <p className="estado-msg">
            {puedeGestionar
              ? "Todavía no hay residentes. Crea el primero con el botón de arriba."
              : "Pronto conocerás a nuestros residentes."}
          </p>
        )}

        <div className="residentes-grid">
          {!loading && !error && residentes.map((residente) => (
            <div className="residente-card" key={residente.id_residente}>
              <div
                className="residente-img"
                style={residente.imagen ? { backgroundImage: `url(${getImagenUrl(residente.imagen)})` } : undefined}
              />

              <div className="residente-info">
                <div className="residente-info-fila">
                  <div>
                    <h3 className="residente-nombre">{residente.nombre}</h3>
                    {residente.descripcion && (
                      <p className="residente-descripcion">{residente.descripcion}</p>
                    )}
                  </div>
                  <button className="residente-ver-btn">Ver</button>
                </div>

                {puedeGestionar && (
                  <div className="residente-admin-actions">
                    <button onClick={() => abrirEditar(residente)}>
                      <AiOutlineEdit size={18} /> Editar
                    </button>
                    <button className="danger" onClick={() => handleEliminar(residente)}>
                      <AiOutlineDelete size={18} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box">
            <h2>{editandoId ? "Editar residente" : "Crear residente"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  maxLength={80}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción corta</label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  maxLength={150}
                  placeholder="Ej: Piercings y Tatuajes"
                />
              </div>

              <div className="form-group">
                <label>Imagen de portada (opcional)</label>
                <div className="file-upload-container">
                  <label className="custom-file-upload">
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="file-upload-name">
                    {imagenArchivo
                      ? imagenArchivo.name
                      : editandoId
                        ? "Se mantiene la imagen actual"
                        : "Ningún archivo seleccionado"}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}