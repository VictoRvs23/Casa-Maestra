import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import api from "../services/api";
import { getImagenUrl } from "../services/residente.services.js";
import { Pencil, Eye, EyeOff } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Residente.css";

const FORM_INICIAL = { nombre: "", descripcion: "" };

const estadoDe = (r) => {
  if (!r.activa) return { texto: "Oculta", clase: "oculta" };
  if (!r.publicada) return { texto: "Sin publicar", clase: "borrador" };
  return null;
};

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
  const [guardando, setGuardando] = useState(false);

  const fetchResidentes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/residentes", {
        params: { limit: 50, ...(puedeGestionar ? { todas: 1 } : {}) },
      });
      setResidentes(data.residentes);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los residentes.");
    } finally {
      setLoading(false);
    }
  }, [puedeGestionar]);

  useEffect(() => {
    fetchResidentes();
  }, [fetchResidentes]);

  const abrirEditar = (residente) => {
    setEditandoId(residente.id_residente);
    setForm({ nombre: residente.nombre, descripcion: residente.descripcion || "" });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.put(`/residentes/${editandoId}`, form);
      cerrarModal();
      fetchResidentes();
      alerta("El residente se actualizó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el residente.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleAlternarVisibilidad = async (residente) => {
    const ocultar = residente.activa;
    const ok = await confirmar(
      ocultar
        ? `¿Ocultar a "${residente.nombre}"? Dejará de aparecer en Residentes, pero su página y sus datos se conservan.`
        : `¿Volver a mostrar a "${residente.nombre}"? Aparecerá en Residentes si su página está publicada.`,
      { textoConfirmar: ocultar ? "Ocultar" : "Mostrar" }
    );
    if (!ok) return;
    try {
      await api.put(`/residentes/${residente.id_residente}`, { activa: !residente.activa });
      fetchResidentes();
      alerta(ocultar ? "La tarjeta quedó oculta." : "La tarjeta vuelve a mostrarse.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo cambiar la visibilidad.", { tipo: "error" });
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
          <p className="residentes-nota-staff" role="note">
            Las tarjetas se crean solas cuando una cuenta recibe el rol Residente. Cada artista elige su nombre y su
            descripción desde «Mi página» y la publica. Aquí puedes corregirlas u ocultarlas.
          </p>
        )}

        {loading && <p className="estado-msg">Cargando residentes...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && residentes.length === 0 && (
          <p className="estado-msg">
            {puedeGestionar
              ? "Todavía no hay residentes. Aparecerán cuando una cuenta tenga el rol Residente."
              : "Pronto conocerás a nuestros residentes."}
          </p>
        )}

        <div className="residentes-grid">
          {!loading && !error && residentes.map((residente) => {
            const estado = puedeGestionar ? estadoDe(residente) : null;
            return (
              <div className={`residente-card ${estado ? "no-visible" : ""}`} key={residente.id_residente}>
                <div
                  className="residente-img"
                  style={residente.imagen ? { backgroundImage: `url(${getImagenUrl(residente.imagen)})` } : undefined}
                >
                  {estado && <span className={`residente-estado ${estado.clase}`}>{estado.texto}</span>}
                </div>

                <div className="residente-info">
                  <div className="residente-info-fila">
                    <div>
                      <h3 className="residente-nombre">{residente.nombre}</h3>
                      {residente.descripcion && <p className="residente-descripcion">{residente.descripcion}</p>}
                    </div>
                    {!estado && (
                      <Link to={`/residentes/${residente.slug}`} className="residente-ver-btn">
                        Ver
                      </Link>
                    )}
                  </div>

                  {puedeGestionar && (
                    <div className="residente-admin-actions">
                      <button onClick={() => abrirEditar(residente)}>
                        <Icono icon={Pencil} size={18} /> Editar
                      </button>
                      <button onClick={() => handleAlternarVisibilidad(residente)}>
                        <Icono icon={residente.activa ? EyeOff : Eye} size={18} />
                        {residente.activa ? " Ocultar" : " Mostrar"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box">
            <h2>Editar residente</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre artístico</label>
                <input name="nombre" value={form.nombre} onChange={handleFormChange} maxLength={80} required />
                <small className="form-ayuda">Si lo cambias, el enlace de su página también cambia.</small>
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