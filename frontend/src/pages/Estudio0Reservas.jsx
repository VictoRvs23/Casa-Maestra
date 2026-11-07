import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getReservas, getMisReservas, cancelarReserva, hoyEnChile } from "../services/estudio0.services.js";

import "../styles/Estudio0.css";

const GESTORES = ["Admin", "Fundador/a"];

const PERIODOS = [
  { id: "proximas", label: "Próximas" },
  { id: "pasadas", label: "Pasadas" },
  { id: "canceladas", label: "Canceladas" },
  { id: "todas", label: "Todas" },
];

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const plata = (n) => `$${Number(n).toLocaleString("es-CL")}`;
const minutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

const partesFecha = (fecha) => {
  const [y, m, d] = fecha.split("-").map(Number);
  return { dia: d, mes: MESES[m - 1], semana: DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
};

const minutosAhoraEnChile = () => {
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  return minutos(hhmm);
};

const esFutura = (r, hoy, ahora) => r.fecha > hoy || (r.fecha === hoy && minutos(r.hora_fin) > ahora);

const normalizarPropia = (r) => {
  const hora_inicio = String(r.hora_inicio).slice(0, 5);
  const hora_fin = String(r.hora_fin).slice(0, 5);
  const horas = (minutos(hora_fin) - minutos(hora_inicio)) / 60;
  return {
    id_reserva: r.id_reserva,
    fecha: r.fecha,
    hora_inicio,
    hora_fin,
    estado: r.estado,
    horas,
    total: horas * (r.estudio?.precio || 0),
    usuario: null,
  };
};

export default function Estudio0Reservas() {
  const { user, loading: cargandoSesion } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const navigate = useNavigate();

  const esGestor = GESTORES.includes(user?.rol);

  const [periodo, setPeriodo] = useState("proximas");
  const [page, setPage] = useState(1);
  const [reservas, setReservas] = useState([]);
  const [cuentas, setCuentas] = useState({});
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  const hoy = useMemo(() => hoyEnChile(), []);
  const ahora = minutosAhoraEnChile();

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (esGestor) {
        const data = await getReservas({ periodo, page, limit: 10 });
        setReservas(data.reservas);
        setCuentas(data.cuentas);
        setTotalPaginas(data.totalPages);
      } else {
        const propias = (await getMisReservas()).map(normalizarPropia);
        const de = (p) =>
          propias.filter((r) => {
            if (p === "canceladas") return r.estado === "cancelada";
            if (p === "todas") return true;
            if (r.estado !== "confirmada") return false;
            return p === "proximas" ? esFutura(r, hoy, ahora) : !esFutura(r, hoy, ahora);
          });
        const lista = de(periodo).sort((a, b) => {
          const orden = `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`);
          return periodo === "proximas" ? orden : -orden;
        });
        setReservas(lista);
        setCuentas(Object.fromEntries(PERIODOS.map((p) => [p.id, de(p.id).length])));
        setTotalPaginas(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar las reservas.");
    } finally {
      setLoading(false);
    }
  }, [user, esGestor, periodo, page, hoy, ahora]);

  useEffect(() => {
    if (!cargandoSesion) cargar();
  }, [cargandoSesion, cargar]);

  const elegirPeriodo = (id) => {
    setPeriodo(id);
    setPage(1);
  };

  const cancelar = async (r) => {
    const { dia, mes } = partesFecha(r.fecha);
    const ok = await confirmar(
      `¿Cancelar la reserva del ${dia} de ${mes}, ${r.hora_inicio} a ${r.hora_fin}? Las horas quedarán libres.`,
      { textoConfirmar: "Cancelar reserva" }
    );
    if (!ok) return;
    setCancelando(r.id_reserva);
    try {
      await cancelarReserva(r.id_reserva);
      alerta("La reserva se canceló.", { tipo: "exito" });
      cargar();
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo cancelar la reserva.", { tipo: "error" });
    } finally {
      setCancelando(null);
    }
  };

  const etiquetaEstado = (r) => {
    if (r.estado === "cancelada") return { texto: "Cancelada", clase: "cancelada" };
    return esFutura(r, hoy, ahora) ? { texto: "Confirmada", clase: "confirmada" } : { texto: "Realizada", clase: "realizada" };
  };

  const titulo = esGestor ? "Reservas" : "Mis reservas";
  const subtitulo = esGestor
    ? "Todas las reservas del Estudio 0, con la persona que reservó."
    : "Las horas que has reservado en el Estudio 0.";

  return (
    <div className="e0-page">
      <Navbar />

      <div className="e0-hero">
        <button type="button" className="e0-volver" onClick={() => navigate("/estudio0")}>
          ← Volver al Estudio 0
        </button>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      <main className="e0-reservas">
        {!cargandoSesion && !user && (
          <div className="e0-panel e0-aviso">
            <p>Inicia sesión para ver tus reservas.</p>
            <Link to="/login" className="btn-primary">
              Iniciar sesión
            </Link>
          </div>
        )}

        {user && (
          <>
            <div className="e0-tabs" role="tablist" aria-label="Período de las reservas">
              {PERIODOS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  role="tab"
                  aria-selected={periodo === p.id}
                  className={`e0-tab ${periodo === p.id ? "activo" : ""}`}
                  onClick={() => elegirPeriodo(p.id)}
                >
                  {p.label}
                  {cuentas[p.id] !== undefined && <span className="e0-tab-cuenta">{cuentas[p.id]}</span>}
                </button>
              ))}
            </div>

            {loading && <p className="e0-estado">Cargando reservas...</p>}
            {!loading && error && <p className="e0-estado e0-estado-error">{error}</p>}

            {!loading && !error && reservas.length === 0 && (
              <div className="e0-panel e0-aviso">
                <p>No hay reservas en esta pestaña.</p>
                {!esGestor && (
                  <button type="button" className="btn-primary" onClick={() => navigate("/estudio0/agenda")}>
                    Reservar una hora
                  </button>
                )}
              </div>
            )}

            {!loading && !error && reservas.length > 0 && (
              <ul className="e0-reservas-lista">
                {reservas.map((r) => {
                  const f = partesFecha(r.fecha);
                  const estado = etiquetaEstado(r);
                  const puedeCancelar = r.estado === "confirmada" && esFutura(r, hoy, ahora);
                  return (
                    <li className="e0-reserva" key={r.id_reserva}>
                      <span className="e0-cinta" aria-hidden="true" />
                      <div className="e0-reserva-fecha">
                        <b>{f.dia}</b>
                        <small>{f.mes}</small>
                      </div>

                      <div className="e0-reserva-datos">
                        <strong>
                          {f.semana}, {r.hora_inicio} – {r.hora_fin}
                        </strong>
                        <span>
                          {r.horas} {r.horas === 1 ? "hora" : "horas"} · {plata(r.total)}
                        </span>
                        {r.usuario && (
                          <span className="e0-reserva-persona">
                            {r.usuario.nombre} {r.usuario.apellido} · {r.usuario.email}
                            {r.usuario.telefono ? ` · ${r.usuario.telefono}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="e0-reserva-lado">
                        <span className={`e0-pill ${estado.clase}`}>{estado.texto}</span>
                        {puedeCancelar && (
                          <button
                            type="button"
                            className="e0-cancelar"
                            disabled={cancelando === r.id_reserva}
                            onClick={() => cancelar(r)}
                          >
                            {cancelando === r.id_reserva ? "Cancelando..." : "Cancelar"}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {esGestor && totalPaginas > 1 && (
              <div className="e0-paginas">
                <button type="button" className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ‹ Anterior
                </button>
                <span>
                  Página {page} de {totalPaginas}
                </span>
                <button type="button" className="btn-ghost" disabled={page >= totalPaginas} onClick={() => setPage(page + 1)}>
                  Siguiente ›
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}