import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import {
  getResidentes,
  createResidente,
  updateResidente,
  deleteResidente,
  getCuentasDisponibles,
  getImagenUrl,
} from "../services/residente.services.js";
import { Pencil, Trash2 } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Residente.css";

const FORM_INICIAL = { nombre: "", descripcion: "", id_usuario: "" };

export default function Residente() {
  const { user } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const puedeGestionar = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cuentas, setCuentas] = useState([]);

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

  const cargarCuentas = async (id_residente) => {
    try {
      const data = await getCuentasDisponibles(id_residente);
      setCuentas(data.cuentas || []);
    } catch (err) {
      console.error(err);
      setCuentas([]);
    }
  };

  const abrirCrear = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setImagenArchivo(null);
    setModalAbierto(true);
    cargarCuentas();
  };

  const abrirEditar = (residente) => {
    setEditandoId(residente.id_residente);
    setForm({
      nombre: residente.nombre,
      descripcion: residente.descripcion || "",
      id_usuario: residente.id_usuario ? String(residente.id_usuario) : "",
    });
    setImagenArchivo(null);
    setModalAbierto(true);
    cargarCuentas(residente.id_residente);
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
    formData.append("id_usuario", form.id_usuario);
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
      alerta(
        editandoId ? "El residente se actualizó correctamente." : "El residente se creó correctamente.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el residente.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (residente) => {
    const ok = await confirmar(`¿Eliminar a "${residente.nombre}"? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await deleteResidente(residente.id_residente);
      fetchResidentes();
      alerta("El residente se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo eliminar el residente.", { tipo: "error" });
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
                  <Link to={`/residentes/${residente.slug}`} className="residente-ver-btn">
                    Ver
                  </Link>
                </div>

                {puedeGestionar && (
                  <div className="residente-admin-actions">
                    <button onClick={() => abrirEditar(residente)}>
                      <Icono icon={Pencil} size={18} /> Editar
                    </button>
                    <button className="danger" onClick={() => handleEliminar(residente)}>
                      <Icono icon={Trash2} size={18} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />

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
                <label>Cuenta asociada (opcional)</label>
                <select name="id_usuario" value={form.id_usuario} onChange={handleFormChange}>
                  <option value="">Sin cuenta asociada</option>
                  {cuentas.map((c) => (
                    <option key={c.id_usuario} value={c.id_usuario}>
                      {c.nombre} {c.apellido} (@{c.nombre_usuario})
                    </option>
                  ))}
                </select>
                <small className="form-ayuda">
                  La persona con esta cuenta podrá diseñar su página desde "Mi página".
                </small>
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