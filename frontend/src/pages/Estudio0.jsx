import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getEstudio0, editarEstudio0, getImagenUrl } from "../services/estudio0.services.js";

import "../styles/Estudio0.css";

const GESTORES = ["Admin", "Fundador/a"];

const numero = (v) => Number(v).toLocaleString("es-CL", { maximumFractionDigits: 2 });

export default function Estudio0() {
  const { user } = useAuth();
  const { alerta } = useAlerta();
  const navigate = useNavigate();

  const [estudio, setEstudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const esGestor = GESTORES.includes(user?.rol);

  useEffect(() => {
    getEstudio0()
      .then(setEstudio)
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "No se pudo cargar el Estudio 0.");
      })
      .finally(() => setLoading(false));
  }, []);

  const abrirEdicion = () => {
    setImagen(null);
    setForm({
      descripcion: estudio.descripcion || "",
      capacidad: String(estudio.capacidad),
      ancho_metros: String(Number(estudio.ancho_metros)),
      largo_metros: String(Number(estudio.largo_metros)),
      precio: String(estudio.precio),
      disponible: estudio.disponible,
    });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const fd = new FormData();
    fd.append("descripcion", form.descripcion);
    fd.append("capacidad", form.capacidad);
    fd.append("ancho_metros", form.ancho_metros);
    fd.append("largo_metros", form.largo_metros);
    fd.append("precio", form.precio);
    fd.append("disponible", form.disponible);
    if (imagen) fd.append("imagen", imagen);

    try {
      const { estudio: actualizado } = await editarEstudio0(estudio.id_estudio, fd);
      setEstudio(actualizado);
      setForm(null);
      alerta("El Estudio 0 se actualizó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar la información.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const elegirImagen = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
      alerta("Solo se permiten imágenes JPG, PNG o WEBP.", { tipo: "advertencia" });
      e.target.value = "";
      return;
    }
    setImagen(archivo);
  };

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <div className="e0-page">
      <Navbar />

      <div className="e0-hero">
        <h1>Estudio 0</h1>
        <p>Reserva el espacio adecuado para tu oficio: una sala equipada, por hora.</p>
      </div>

      <main className="e0-wrap">
        {loading && <p className="e0-estado">Cargando Estudio 0...</p>}
        {!loading && error && <p className="e0-estado e0-estado-error">{error}</p>}

        {!loading && estudio && (
          <article className="e0-card">
            <span className="e0-cinta" aria-hidden="true" />

            {esGestor && (
              <button type="button" className="e0-editar" onClick={abrirEdicion}>
                Editar
              </button>
            )}

            <div className="e0-foto">
              {estudio.imagen ? (
                <img src={getImagenUrl(estudio.imagen)} alt="Foto del Estudio 0" />
              ) : (
                <span>Aún no hay foto del Estudio 0</span>
              )}
            </div>

            <div className="e0-datos">
              <ul className="e0-lista">
                <li>Hasta {estudio.capacidad} {estudio.capacidad === 1 ? "persona" : "personas"}</li>
                <li>
                  {numero(estudio.ancho_metros)} x {numero(estudio.largo_metros)} metros (
                  {numero(Number(estudio.ancho_metros) * Number(estudio.largo_metros))} m²)
                </li>
              </ul>

              <div className="e0-botones">
                <button type="button" className="btn-ghost" onClick={() => navigate("/estudio0/agenda")}>
                  Ver agenda
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!estudio.disponible}
                  onClick={() => navigate("/estudio0/agenda")}
                >
                  Reservar
                </button>
              </div>
            </div>

            {estudio.descripcion && <p className="e0-descripcion">{estudio.descripcion}</p>}

            <div className="e0-pie">
              <div className="e0-precio">
                ${numero(estudio.precio)} <small>/ hora</small>
              </div>
              {estudio.disponible ? (
                <span className="e0-nota">Confirmación inmediata si la hora está libre</span>
              ) : (
                <span className="e0-nota e0-nota-aviso">No disponible por ahora</span>
              )}
            </div>

            {esGestor && (
              <div className="e0-gestion">
                <button type="button" className="btn-ghost" onClick={() => navigate("/estudio0/horarios")}>
                  Gestionar horarios
                </button>
              </div>
            )}
          </article>
        )}
      </main>

      <Footer />

      {form && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <div className="modal-box modal-box-ancho">
            <h2>Editar Estudio 0</h2>
            <form onSubmit={handleGuardar}>
              <div className="modal-field">
                <label htmlFor="e0-descripcion">Descripción</label>
                <textarea id="e0-descripcion" rows={3} maxLength={1000} value={form.descripcion} onChange={set("descripcion")} />
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label htmlFor="e0-capacidad">Capacidad (personas)</label>
                  <input id="e0-capacidad" type="number" min="1" step="1" value={form.capacidad} onChange={set("capacidad")} required />
                </div>
                <div className="modal-field">
                  <label htmlFor="e0-precio">Precio por hora ($)</label>
                  <input id="e0-precio" type="number" min="0" step="500" value={form.precio} onChange={set("precio")} required />
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label htmlFor="e0-ancho">Ancho (m)</label>
                  <input id="e0-ancho" type="number" min="0.5" step="0.1" value={form.ancho_metros} onChange={set("ancho_metros")} required />
                </div>
                <div className="modal-field">
                  <label htmlFor="e0-largo">Largo (m)</label>
                  <input id="e0-largo" type="number" min="0.5" step="0.1" value={form.largo_metros} onChange={set("largo_metros")} required />
                </div>
              </div>

              <div className="modal-field">
                <label htmlFor="e0-imagen">Foto</label>
                <input id="e0-imagen" type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirImagen} />
                {imagen && <small className="e0-ayuda">Se subirá: {imagen.name}</small>}
              </div>

              <label className="e0-check">
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                />
                Aceptar reservas
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}