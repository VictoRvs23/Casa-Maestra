import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getArriendos, getMisArriendos, cancelarArriendo } from "../services/arriendo.services.js";
import { hoyEnChile } from "../services/estudio0.services.js";
import { ArrowLeft } from "@sketchicon/lucide";
import "../styles/Estudio0.css";

const GESTORES = ["Admin", "Fundador/a"];

const PERIODOS = [
  { id: "activos", label: "Activos" },
  { id: "finalizados", label: "Finalizados" },
  { id: "cancelados", label: "Cancelados" },
  { id: "todos", label: "Todos" },
];

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const plata = (n) => `$${Number(n).toLocaleString("es-CL")}`;
const mesDe = (fecha) => fecha.slice(0, 7);
const nombreMes = (fecha) => `${MESES[Number(fecha.slice(5, 7)) - 1]} ${fecha.slice(0, 4)}`;
const abreviado = (fecha) => MESES[Number(fecha.slice(5, 7)) - 1].slice(0, 3);

const estadoDe = (a, hoy) => {
  if (a.estado === "cancelada") return { texto: "Cancelado", clase: "cancelada" };
  if (a.fecha_fin < hoy) return { texto: "Finalizado", clase: "realizada" };
  if (a.fecha_inicio <= hoy) return { texto: "Vigente", clase: "confirmada" };
  return { texto: "Próximo", clase: "confirmada" };
};

const coincide = (a, periodo, hoy) => {
  if (periodo === "todos") return true;
  if (periodo === "cancelados") return a.estado === "cancelada";
  if (a.estado !== "confirmada") return false;
  return periodo === "activos" ? a.fecha_fin >= hoy : a.fecha_fin < hoy;
};

export default function EstudiosArriendos() {
  const { user, loading: cargandoSesion } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const navigate = useNavigate();

  const esGestor = GESTORES.includes(user?.rol);
  const hoy = useMemo(() => hoyEnChile(), []);

  const [periodo, setPeriodo] = useState("activos");
  const [page, setPage] = useState(1);
  const [arriendos, setArriendos] = useState([]);
  const [cuentas, setCuentas] = useState({});
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (esGestor) {
        const data = await getArriendos({ periodo, page, limit: 10 });
        setArriendos(data.arriendos);
        setCuentas(data.cuentas);
        setTotalPaginas(data.totalPages);
      } else {
        // Los arriendos propios son pocos: se filtran aquí mismo.
        const propios = await getMisArriendos();
        const lista = propios
          .filter((a) => coincide(a, periodo, hoy))
          .sort((a, b) =>
            periodo === "activos"
              ? a.fecha_inicio.localeCompare(b.fecha_inicio)
              : b.fecha_inicio.localeCompare(a.fecha_inicio)
          );
        setArriendos(lista);
        setCuentas(Object.fromEntries(PERIODOS.map((p) => [p.id, propios.filter((a) => coincide(a, p.id, hoy)).length])));
        setTotalPaginas(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar los arriendos.");
    } finally {
      setLoading(false);
    }
  }, [user, esGestor, periodo, page, hoy]);

  useEffect(() => {
    if (!cargandoSesion) cargar();
  }, [cargandoSesion, cargar]);

  const elegirPeriodo = (id) => {
    setPeriodo(id);
    setPage(1);
  };

  const cancelar = async (a) => {
    const ok = await confirmar(
      `¿Cancelar el arriendo de ${a.estudio?.nombre || "este estudio"} desde ${nombreMes(a.fecha_inicio)}? Los meses quedarán libres.`,
      { textoConfirmar: "Cancelar arriendo" }
    );
    if (!ok) return;
    setCancelando(a.id_arriendo);
    try {
      await cancelarArriendo(a.id_arriendo);
      alerta("El arriendo se canceló.", { tipo: "exito" });
      cargar();
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo cancelar el arriendo.", { tipo: "error" });
    } finally {
      setCancelando(null);
    }
  };

  const titulo = esGestor ? "Arriendos" : "Mis arriendos";
  const subtitulo = esGestor
    ? "Todos los arriendos mensuales de los estudios, con la persona que arrendó."
    : "Los estudios que has arrendado por mes.";

  return (
    <div className="e0-page">
      <Navbar />

      <div className="e0-hero">
        <button
          type="button"
          className="e0-volver"
          aria-label="Volver a Estudios"
          title="Volver a Estudios"
          onClick={() => navigate("/estudios")}
        >
          <Icono icon={ArrowLeft} size={18} />
        </button>
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      <main className="e0-reservas">
        {!cargandoSesion && !user && (
          <div className="e0-panel e0-aviso">
            <p>Inicia sesión para ver tus arriendos.</p>
            <Link to="/login" className="btn-primary">
              Iniciar sesión
            </Link>
          </div>
        )}

        {user && (
          <>
            <div className="e0-tabs" role="tablist" aria-label="Estado de los arriendos">
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

            {loading && <p className="e0-estado">Cargando arriendos...</p>}
            {!loading && error && <p className="e0-estado e0-estado-error">{error}</p>}

            {!loading && !error && arriendos.length === 0 && (
              <div className="e0-panel e0-aviso">
                <p>No hay arriendos en esta pestaña.</p>
                {!esGestor && (
                  <button type="button" className="btn-primary" onClick={() => navigate("/estudios")}>
                    Ver estudios
                  </button>
                )}
              </div>
            )}

            {!loading && !error && arriendos.length > 0 && (
              <ul className="e0-reservas-lista">
                {arriendos.map((a) => {
                  const estado = estadoDe(a, hoy);
                  const ultimoMes = mesDe(a.fecha_fin);
                  const puedeCancelar =
                    a.estado === "confirmada" && a.fecha_fin >= hoy && (esGestor || a.fecha_inicio > hoy);
                  return (
                    <li className="e0-reserva" key={a.id_arriendo}>
                      <span className="e0-cinta" aria-hidden="true" />
                      <div className="e0-reserva-fecha">
                        <b>{abreviado(a.fecha_inicio)}</b>
                        <small>{a.fecha_inicio.slice(0, 4)}</small>
                      </div>

                      <div className="e0-reserva-datos">
                        <strong>
                          {a.estudio?.nombre} · {a.meses} {a.meses === 1 ? "mes" : "meses"}
                        </strong>
                        <span>
                          {nombreMes(a.fecha_inicio)}
                          {a.meses > 1 ? ` – ${nombreMes(`${ultimoMes}-01`)}` : ""} · {plata(a.total)}
                        </span>
                        {a.usuario && (
                          <span className="e0-reserva-persona">
                            {a.usuario.nombre} {a.usuario.apellido} · {a.usuario.email}
                            {a.usuario.telefono ? ` · ${a.usuario.telefono}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="e0-reserva-lado">
                        <span className={`e0-pill ${estado.clase}`}>{estado.texto}</span>
                        {puedeCancelar && (
                          <button
                            type="button"
                            className="e0-cancelar"
                            disabled={cancelando === a.id_arriendo}
                            onClick={() => cancelar(a)}
                          >
                            {cancelando === a.id_arriendo ? "Cancelando..." : "Cancelar"}
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