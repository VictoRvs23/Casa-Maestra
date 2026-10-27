import React, { useEffect, useState, useCallback } from "react";
import { useAlerta } from "../../context/AlertaContext.jsx";
import { getMisTickets, createTicket } from "../../services/ticket.services.js";
import { CATEGORIAS_SOPORTE } from "../../constants/categoriasSoporte.js";
import EstadoTicket, { formatearFecha } from "./EstadoTicket.jsx";

const FORM_INICIAL = { asunto: "", mensaje: "", categoria: CATEGORIAS_SOPORTE[0] };

export default function MisTickets() {
  const { alerta } = useAlerta();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMisTickets();
      setTickets(data.tickets);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_INICIAL);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await createTicket(form);
      cerrarModal();
      fetchTickets();
      alerta("Tu ticket se envió correctamente. Te responderemos pronto.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo enviar el ticket.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="soporte-bloque">
        <p className="soporte-intro">
          ¿No encontraste lo que buscabas? Crea un ticket y el equipo de Casa Maestra te responderá.
        </p>

        <div className="soporte-toolbar">
          <button className="soporte-create-btn" onClick={() => setModalAbierto(true)}>
            + Crear ticket
          </button>
        </div>

        {loading && <p className="estado-msg">Cargando tus tickets...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && tickets.length === 0 && (
          <p className="estado-msg">Todavía no has creado ningún ticket.</p>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="ticket-lista">
            {tickets.map((t) => (
              <div className="ticket-card" key={t.id_ticket}>
                <div className="ticket-card-head">
                  <div>
                    <h3 className="ticket-asunto">{t.asunto}</h3>
                    <small className="ticket-meta">
                      #{t.id_ticket} · {t.categoria} · {formatearFecha(t.created_at)}
                    </small>
                  </div>
                  <EstadoTicket estado={t.estado} />
                </div>

                <p className="ticket-mensaje">{t.mensaje}</p>

                {t.respuesta && (
                  <div className="ticket-respuesta">
                    <strong>Respuesta de Casa Maestra</strong>
                    <p>{t.respuesta}</p>
                    {t.respondido_at && <small>{formatearFecha(t.respondido_at)}</small>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box">
            <h2>Crear ticket</h2>
            <form onSubmit={handleEnviar}>
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleFormChange} required>
                  {CATEGORIAS_SOPORTE.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Asunto</label>
                <input
                  name="asunto"
                  value={form.asunto}
                  onChange={handleFormChange}
                  maxLength={120}
                  minLength={5}
                  placeholder="Ej: No puedo reservar el Estudio 2"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleFormChange}
                  maxLength={2000}
                  minLength={10}
                  rows={6}
                  placeholder="Cuéntanos con detalle qué necesitas"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}