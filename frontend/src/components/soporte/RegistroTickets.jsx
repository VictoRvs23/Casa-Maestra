import React, { useEffect, useState, useCallback } from "react";
import { useAlerta } from "../../context/AlertaContext.jsx";
import { getTickets, updateTicket } from "../../services/ticket.services.js";
import { CATEGORIAS_SOPORTE } from "../../constants/categoriasSoporte.js";
import { ESTADOS_TICKET } from "../../constants/estadosTicket.js";
import EstadoTicket, { formatearFecha } from "./EstadoTicket.jsx";

export default function RegistroTickets() {
  const { alerta } = useAlerta();

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [seleccionado, setSeleccionado] = useState(null);
  const [formEstado, setFormEstado] = useState("");
  const [formRespuesta, setFormRespuesta] = useState("");
  const [guardando, setGuardando] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets({
        estado: estadoFiltro,
        categoria: categoriaFiltro,
        busqueda: busquedaAplicada,
        page,
      });
      setTickets(data.tickets);
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el registro de tickets.");
    } finally {
      setLoading(false);
    }
  }, [estadoFiltro, categoriaFiltro, busquedaAplicada, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const cambiarFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const buscar = (e) => {
    e.preventDefault();
    setPage(1);
    setBusquedaAplicada(busqueda.trim());
  };

  const abrirTicket = (t) => {
    setSeleccionado(t);
    setFormEstado(t.estado);
    setFormRespuesta(t.respuesta || "");
  };

  const cerrarModal = () => setSeleccionado(null);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const payload = { estado: formEstado };
    if (formRespuesta.trim() !== (seleccionado.respuesta || "")) {
      payload.respuesta = formRespuesta;
    }

    try {
      await updateTicket(seleccionado.id_ticket, payload);
      cerrarModal();
      fetchTickets();
      alerta("El ticket se actualizó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo actualizar el ticket.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const nombreAutor = (u) =>
    u ? `${u.nombre} ${u.apellido}` : "Usuario eliminado";

  return (
    <>
      <div className="soporte-bloque soporte-bloque-ancho">
        <form className="tickets-filtros" onSubmit={buscar}>
          <input
            type="search"
            placeholder="Buscar por asunto, mensaje o usuario"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={estadoFiltro} onChange={cambiarFiltro(setEstadoFiltro)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {ESTADOS_TICKET.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={categoriaFiltro} onChange={cambiarFiltro(setCategoriaFiltro)} aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>
            {CATEGORIAS_SOPORTE.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="soporte-create-btn">Buscar</button>
        </form>

        {loading && <p className="estado-msg">Cargando tickets...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && tickets.length === 0 && (
          <p className="estado-msg">No hay tickets que coincidan.</p>
        )}

        {!loading && !error && tickets.length > 0 && (
          <>
            <div className="tickets-tabla-wrap">
              <table className="tickets-tabla">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Usuario</th>
                    <th>Categoría</th>
                    <th>Asunto</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id_ticket}>
                      <td>{t.id_ticket}</td>
                      <td>
                        {nombreAutor(t.usuario)}
                        {t.usuario && <small className="ticket-meta">@{t.usuario.nombre_usuario}</small>}
                      </td>
                      <td>{t.categoria}</td>
                      <td className="tickets-asunto">{t.asunto}</td>
                      <td><EstadoTicket estado={t.estado} /></td>
                      <td>{formatearFecha(t.created_at)}</td>
                      <td>
                        <button className="ticket-ver-btn" onClick={() => abrirTicket(t)}>
                          {t.respuesta ? "Ver" : "Responder"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tickets-paginacion">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Página anterior">‹</button>
              <span>{page} / {totalPages} · {total} tickets</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Página siguiente">›</button>
            </div>
          </>
        )}
      </div>

      {seleccionado && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box modal-box-ancho">
            <h2>Ticket #{seleccionado.id_ticket}</h2>

            <div className="ticket-detalle">
              <p><strong>Usuario:</strong> {nombreAutor(seleccionado.usuario)}
                {seleccionado.usuario && ` (${seleccionado.usuario.rol})`}</p>
              {seleccionado.usuario && <p><strong>Correo:</strong> {seleccionado.usuario.email}</p>}
              <p><strong>Categoría:</strong> {seleccionado.categoria} · <strong>Creado:</strong> {formatearFecha(seleccionado.created_at)}</p>
              <p><strong>Asunto:</strong> {seleccionado.asunto}</p>
              <div className="ticket-mensaje-caja">{seleccionado.mensaje}</div>
            </div>

            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Estado</label>
                <select value={formEstado} onChange={(e) => setFormEstado(e.target.value)}>
                  {ESTADOS_TICKET.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Respuesta</label>
                <textarea
                  value={formRespuesta}
                  onChange={(e) => setFormRespuesta(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="Escribe la respuesta para el usuario"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={cerrarModal}>Cerrar</button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}