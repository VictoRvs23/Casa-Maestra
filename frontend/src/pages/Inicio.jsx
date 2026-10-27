import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import {
  getTalleres,
  getTaller,
  createTaller,
  updateTaller,
  deleteTaller,
  getArtistasDisponibles,
  getImagenUrl,
} from "../services/taller.services.js";
import { FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Phone, Pencil, Trash2 } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Inicio.css";
import "../styles/Taller.css";

const FORM_INICIAL = { nombre: "", descripcion: "" };

const Inicio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const puedeGestionar = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const seccionTalleresRef = useRef(null);

  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [artistasDisponibles, setArtistasDisponibles] = useState([]);
  const [artistasElegidos, setArtistasElegidos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const fetchTalleres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTalleres();
      setTalleres(data.talleres);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los talleres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalleres();
  }, [fetchTalleres]);

  const cargarArtistas = async () => {
    try {
      const data = await getArtistasDisponibles();
      setArtistasDisponibles(data.artistas);
    } catch (err) {
      console.error(err);
      setArtistasDisponibles([]);
    }
  };

  const abrirCrear = async () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setImagenArchivo(null);
    setArtistasElegidos([]);
    setModalAbierto(true);
    cargarArtistas();
  };

  const abrirEditar = async (taller) => {
    try {
      const detalle = await getTaller(taller.id_taller);
      setEditandoId(taller.id_taller);
      setForm({ nombre: detalle.nombre, descripcion: detalle.descripcion || "" });
      setImagenArchivo(null);
      setArtistasElegidos(detalle.artistas.map((a) => a.id_usuario));
      setModalAbierto(true);
      cargarArtistas();
    } catch (err) {
      console.error(err);
      alerta("No se pudo abrir el taller para editarlo.", { tipo: "error" });
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setImagenArchivo(null);
    setArtistasElegidos([]);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagenArchivo(file);
  };

  const toggleArtista = (id) => {
    setArtistasElegidos((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
    );
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("artistas", artistasElegidos.join(","));
    if (imagenArchivo) {
      formData.append("imagen", imagenArchivo);
    }

    try {
      if (editandoId) {
        await updateTaller(editandoId, formData);
      } else {
        await createTaller(formData);
      }
      cerrarModal();
      fetchTalleres();
      alerta(
        editandoId ? "El taller se actualizó correctamente." : "El taller se creó correctamente.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el taller.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (taller) => {
    const ok = await confirmar(`¿Eliminar el taller "${taller.nombre}"? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await deleteTaller(taller.id_taller);
      fetchTalleres();
      alerta("El taller se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo eliminar el taller.", { tipo: "error" });
    }
  };

  const irATalleres = () => {
    seccionTalleresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="inicio-container">
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">CASA MAESTRA</h1>
          <p className="hero-subtitle">Explora talleres, modificaciones corporales y más</p>
          <div className="hero-buttons">
            <button className="hero-btn" onClick={irATalleres}>Conoce nuestros talleres</button>
            <button className="hero-btn" onClick={() => navigate("/residentes")}>
              Conoce a nuestros artistas
            </button>
          </div>
        </div>
      </section>

      <section className="categories-section" ref={seccionTalleresRef}>
        {puedeGestionar && (
          <div className="talleres-toolbar">
            <button className="talleres-create-btn" onClick={abrirCrear}>
              + Crear taller
            </button>
          </div>
        )}

        {loading && <p className="empty-categories">Cargando talleres...</p>}
        {!loading && error && <p className="empty-categories estado-error">{error}</p>}

        {!loading && !error && talleres.length === 0 && (
          <div className="empty-categories">
            <p>
              {puedeGestionar
                ? "Todavía no hay talleres. Crea el primero con el botón de arriba."
                : "Próximamente nuevos talleres disponibles. ¡Mantente atento!"}
            </p>
          </div>
        )}

        {!loading && !error && talleres.length > 0 && (
          <div className="categories-grid">
            {talleres.map((taller) => {
              const imagen = getImagenUrl(taller.imagen);
              return (
                <div className="category-card" key={taller.id_taller}>
                  <Link to={`/talleres/${taller.id_taller}`} className="category-link">
                    <div className="category-img-wrapper">
                      {imagen && <img src={imagen} alt={taller.nombre} className="category-img" />}
                    </div>
                    <h3 className="category-title">{taller.nombre}</h3>
                  </Link>

                  {puedeGestionar && (
                    <div className="category-admin-actions">
                      <button onClick={() => abrirEditar(taller)}>
                        <Icono icon={Pencil} size={16} /> Editar
                      </button>
                      <button className="danger" onClick={() => handleEliminar(taller)}>
                        <Icono icon={Trash2} size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="inicio-footer">
        <div className="footer-content">
          <span className="footer-item"><FaInstagram size={20} /> casamaestra_cl</span>
          <span className="footer-item"><Icono icon={Phone} size={18} /> 9 11111111</span>
          <span className="footer-item"><SiGmail size={20} /> casamaestra@gmail.com</span>
        </div>
      </footer>

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box">
            <h2>{editandoId ? "Editar taller" : "Crear taller"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  maxLength={80}
                  placeholder="Ej: Cerámica"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  maxLength={1500}
                  rows={5}
                  placeholder="Cuenta en qué consiste el taller"
                />
              </div>

              <div className="form-group">
                <label>Imagen (opcional)</label>
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

              <div className="form-group">
                <label>Artistas que trabajan aquí</label>
                {artistasDisponibles.length === 0 ? (
                  <p className="artistas-vacio">No hay residentes registrados todavía.</p>
                ) : (
                  <div className="artistas-checklist">
                    {artistasDisponibles.map((a) => (
                      <label key={a.id_usuario} className="artista-check">
                        <input
                          type="checkbox"
                          checked={artistasElegidos.includes(a.id_usuario)}
                          onChange={() => toggleArtista(a.id_usuario)}
                        />
                        <span>{a.nombre} {a.apellido}</span>
                        <small>@{a.nombre_usuario}</small>
                      </label>
                    ))}
                  </div>
                )}
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
};

export default Inicio;