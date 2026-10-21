import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import {
  getEstudios,
  createEstudio,
  updateEstudio,
  deleteEstudio,
  getImagenUrl,
} from "../services/estudio.services.js";
import { Search, User, Pencil, Trash2, Ruler, CircleCheck, CircleX } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Estudio.css";

const ESTADO_INICIAL_FORM = {
  nombre: "",
  descripcion: "",
  capacidad: "",
  ancho_metros: "",
  largo_metros: "",
  precio: "",
  disponible: true,
};

export default function Estudios() {
  const { user } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const puedeGestionar = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [capacidadFiltro, setCapacidadFiltro] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [imagenArchivo, setImagenArchivo] = useState(null);

  const fetchEstudios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstudios({
        tipo_arriendo: "mensual",
        capacidad: capacidadFiltro,
        busqueda: busquedaAplicada,
        limit: 24,
      });
      setEstudios(data.estudios);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los estudios.");
    } finally {
      setLoading(false);
    }
  }, [capacidadFiltro, busquedaAplicada]);

  useEffect(() => {
    fetchEstudios();
  }, [fetchEstudios]);

  const aplicarBusqueda = () => setBusquedaAplicada(busquedaInput);

  const abrirCrear = () => {
    setEditandoId(null);
    setForm(ESTADO_INICIAL_FORM);
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (estudio) => {
    setEditandoId(estudio.id_estudio);
    setForm({
      nombre: estudio.nombre,
      descripcion: estudio.descripcion || "",
      capacidad: estudio.capacidad,
      ancho_metros: estudio.ancho_metros,
      largo_metros: estudio.largo_metros,
      precio: estudio.precio,
      disponible: estudio.disponible,
    });
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("capacidad", Number(form.capacidad));
    formData.append("ancho_metros", Number(form.ancho_metros));
    formData.append("largo_metros", Number(form.largo_metros));
    formData.append("precio", Number(form.precio));
    formData.append("tipo_arriendo", "mensual");
    formData.append("disponible", form.disponible);

    if (imagenArchivo) {
      formData.append("imagen", imagenArchivo);
    }

    try {
      if (editandoId) {
        await updateEstudio(editandoId, formData);
      } else {
        await createEstudio(formData);
      }
      setModalAbierto(false);
      fetchEstudios();
      alerta(
        editandoId ? "El estudio se actualizó correctamente." : "El estudio se creó correctamente.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el estudio.", { tipo: "error" });
    }
  };

  const handleEliminar = async (estudio) => {
    const ok = await confirmar(`¿Eliminar "${estudio.nombre}"? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await deleteEstudio(estudio.id_estudio);
      fetchEstudios();
      alerta("El estudio se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta("No se pudo eliminar el estudio.", { tipo: "error" });
    }
  };

  const handleReservar = (estudio) => {
    alerta(`Escríbenos por Soporte para arrendar "${estudio.nombre}". Pronto esto será automático.`, {
      tipo: "info",
      titulo: "Reservar estudio",
    });
  };

  return (
    <div className="estudios-page">
      <Navbar />

      <div className="estudios-hero">
        <h1>Estudios</h1>
        <p>Reserva el espacio adecuado para tu oficio: salas equipadas por hora, día o taller completo.</p>
      </div>

      <div className="estudios-wrap">
        <div className="estudios-filters">
          <div className="filter-field">
            <label>Capacidad mínima</label>
            <select value={capacidadFiltro} onChange={(e) => setCapacidadFiltro(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="2">2 o más personas</option>
              <option value="6">6 o más personas</option>
              <option value="10">10 o más personas</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Buscar por nombre</label>
            <input
              type="text"
              placeholder="Ej: Estudio 2"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarBusqueda()}
            />
          </div>

          <button className="search-btn" onClick={aplicarBusqueda} aria-label="Buscar">
            <Icono icon={Search} size={20} />
          </button>

          {puedeGestionar && (
            <button className="create-btn" onClick={abrirCrear}>
              + Crear estudio
            </button>
          )}
        </div>

        {loading && <p className="estado-msg">Cargando estudios...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && estudios.length === 0 && (
          <p className="estado-msg">No hay estudios que coincidan con tu búsqueda.</p>
        )}

        <div className="estudios-grid">
          {!loading && !error && estudios.map((estudio) => (
            <div className="estudio-card" key={estudio.id_estudio}>
              <div
                className="estudio-img"
                style={estudio.imagen ? { backgroundImage: `url(${getImagenUrl(estudio.imagen)})` } : undefined}
              >
                <span className="estudio-badge">{estudio.nombre}</span>
                <span className={`estado-icono ${estudio.disponible ? "libre" : "ocupado"}`}>
                  {estudio.disponible ? <Icono icon={CircleCheck} size={22} /> : <Icono icon={CircleX} size={22} />}
                </span>
              </div>

              <div className="estudio-info">
                <p>
                  <span className="ico"><Icono icon={User} size={18} /></span> {estudio.capacidad} Personas
                </p>
                <p>
                  <span className="ico"><Icono icon={Ruler} size={18} /></span> {estudio.ancho_metros} x {estudio.largo_metros} metros
                  {" "}({(estudio.ancho_metros * estudio.largo_metros).toFixed(0)} m²)
                </p>

                <div className="estudio-footer">
                  <span className="estudio-precio">
                    ${Number(estudio.precio).toLocaleString("es-CL")} / mensuales
                  </span>
                  <button className="reservar-btn" onClick={() => handleReservar(estudio)}>
                    Reservar
                  </button>
                </div>

                {puedeGestionar && (
                  <div className="admin-actions">
                    <button onClick={() => abrirEditar(estudio)}>
                      <Icono icon={Pencil} size={18} /> Editar
                    </button>
                    <button onClick={() => handleEliminar(estudio)} className="danger">
                      <Icono icon={Trash2} size={18} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAbierto(false)}>
          <div className="modal-box">
            <h2>{editandoId ? "Editar estudio" : "Crear estudio"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleFormChange} required />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleFormChange} rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacidad (personas)</label>
                  <input type="number" name="capacidad" min="1" value={form.capacidad} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Precio mensual (CLP)</label>
                  <input type="number" name="precio" min="0" value={form.precio} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ancho (m)</label>
                  <input type="number" name="ancho_metros" min="0" step="0.1" value={form.ancho_metros} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Largo (m)</label>
                  <input type="number" name="largo_metros" min="0" step="0.1" value={form.largo_metros} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Imagen del estudio (opcional)</label>
                <div className="file-upload-container">
                  <label className="custom-file-upload">
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="file-upload-name">
                    {imagenArchivo ? imagenArchivo.name : "Ningún archivo seleccionado"}
                  </span>
                </div>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleFormChange} />
                Disponible para arriendo
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}