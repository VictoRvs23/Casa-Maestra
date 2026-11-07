import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getEstudio0, editarEstudio0, getImagenUrl } from "../services/estudio0.services.js";
import { User, Pencil, Ruler, CircleCheck, CircleX } from "@sketchicon/lucide";

import "../styles/Estudio.css";
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

  const irAAgenda = () => navigate("/estudio0/agenda");

  return (
    <div className="estudios-page">
      <Navbar />

      <div className="estudios-hero">
        <h1>Estudio 0</h1>
        <p>Reserva el espacio adecuado para tu oficio: una sala equipada, por hora.</p>
      </div>

      <div className="estudios-wrap">
        {loading && <p className="estado-msg">Cargando Estudio 0...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}

        {!loading && estudio && (
          <div className="e0-unico">
            <div className="estudio-card">
              <div
                className="estudio-img"
                style={estudio.imagen ? { backgroundImage: `url(${getImagenUrl(estudio.imagen)})` } : undefined}
              >
                <span className="estudio-badge">Estudio 0</span>
                <span className={`estado-icono ${estudio.disponible ? "libre" : "ocupado"}`}>
                  {estudio.disponible ? <Icono icon={CircleCheck} size={22} /> : <Icono icon={CircleX} size={22} />}
                </span>
              </div>

              <div className="estudio-info">
                <p>
                  <span className="ico"><Icono icon={User} size={18} /></span>
                  Hasta {estudio.capacidad} {Number(estudio.capacidad) === 1 ? "persona" : "personas"}
                </p>
                <p>
                  <span className="ico"><Icono icon={Ruler} size={18} /></span>
                  {numero(estudio.ancho_metros)} x {numero(estudio.largo_metros)} metros (
                  {numero(Number(estudio.ancho_metros) * Number(estudio.largo_metros))} m²)
                </p>

                {estudio.descripcion && <p className="e0-descripcion-card">{estudio.descripcion}</p>}

                <div className="estudio-footer">
                  <span className="estudio-precio">${numero(estudio.precio)} / hora</span>
                  <button className="reservar-btn" disabled={!estudio.disponible} onClick={irAAgenda}>
                    Ver agenda
                  </button>
                </div>

                <p className="e0-nota-card">
                  {estudio.disponible
                    ? "Confirmación inmediata si la hora está libre."
                    : "No acepta reservas por ahora."}
                </p>

                <div className="admin-actions">
                  {user && (
                    <button onClick={() => navigate("/estudio0/reservas")}>
                      {esGestor ? "Ver reservas" : "Mis reservas"}
                    </button>
                  )}
                  {esGestor && (
                    <>
                      <button onClick={abrirEdicion}>
                        <Icono icon={Pencil} size={18} /> Editar
                      </button>
                      <button onClick={() => navigate("/estudio0/horarios")}>Gestionar horarios</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {form && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <div className="modal-box">
            <h2>Editar Estudio 0</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={3} maxLength={1000} value={form.descripcion} onChange={set("descripcion")} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacidad (personas)</label>
                  <input type="number" min="1" step="1" value={form.capacidad} onChange={set("capacidad")} required />
                </div>
                <div className="form-group">
                  <label>Precio por hora (CLP)</label>
                  <input type="number" min="0" step="500" value={form.precio} onChange={set("precio")} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ancho (m)</label>
                  <input type="number" min="0.5" step="0.1" value={form.ancho_metros} onChange={set("ancho_metros")} required />
                </div>
                <div className="form-group">
                  <label>Largo (m)</label>
                  <input type="number" min="0.5" step="0.1" value={form.largo_metros} onChange={set("largo_metros")} required />
                </div>
              </div>

              <div className="form-group">
                <label>Foto (opcional)</label>
                <div className="file-upload-container">
                  <label className="custom-file-upload">
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={elegirImagen}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="file-upload-name">{imagen ? imagen.name : "Ningún archivo seleccionado"}</span>
                </div>
              </div>

              <label className="checkbox-row">
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