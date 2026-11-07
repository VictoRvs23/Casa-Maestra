import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getEstudio0, getAgenda, updateAgenda } from "../services/estudio0.services.js";
import { ArrowLeft } from "@sketchicon/lucide";
import "../styles/Estudio0.css";

const GESTORES = ["Admin", "Fundador/a"];

const DIAS = [
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
  { valor: 0, nombre: "Domingo" },
];

const HORAS_INICIO = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);
const HORAS_FIN = HORAS_INICIO.slice(1);

const hh = (hora) => Number(hora.slice(0, 2));
const fmt = (n) => `${String(n).padStart(2, "0")}:00`;

const agruparPorDia = (bloques) => {
  const porDia = {};
  DIAS.forEach((d) => (porDia[d.valor] = []));
  bloques.forEach((b) =>
    porDia[b.dia_semana]?.push({ hora_inicio: b.hora_inicio.slice(0, 5), hora_fin: b.hora_fin.slice(0, 5) })
  );
  Object.values(porDia).forEach((l) => l.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)));
  return porDia;
};

const errorDelDia = (bloques) => {
  for (let i = 0; i < bloques.length; i++) {
    if (bloques[i].hora_inicio >= bloques[i].hora_fin) return "La hora de fin debe ser posterior a la de inicio.";
    if (i > 0 && bloques[i].hora_inicio < bloques[i - 1].hora_fin) return "Los bloques de un mismo día no pueden cruzarse.";
  }
  return null;
};

export default function Estudio0Horarios() {
  const { user, loading: cargandoSesion } = useAuth();
  const { alerta } = useAlerta();
  const navigate = useNavigate();

  const [estudio, setEstudio] = useState(null);
  const [porDia, setPorDia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const esGestor = GESTORES.includes(user?.rol);

  useEffect(() => {
    if (cargandoSesion || !esGestor) return;
    (async () => {
      try {
        const e = await getEstudio0();
        setEstudio(e);
        setPorDia(agruparPorDia(await getAgenda(e.id_estudio)));
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "No se pudo cargar el horario.");
      } finally {
        setLoading(false);
      }
    })();
  }, [cargandoSesion, esGestor]);

  const cambiarDia = (dia, bloques) => setPorDia((prev) => ({ ...prev, [dia]: bloques }));

  const alternarDia = (dia) => {
    const bloques = porDia[dia];
    cambiarDia(dia, bloques.length ? [] : [{ hora_inicio: "10:00", hora_fin: "19:00" }]);
  };

  const cambiarBloque = (dia, i, campo, valor) =>
    cambiarDia(dia, porDia[dia].map((b, j) => (j === i ? { ...b, [campo]: valor } : b)));

  const agregarBloque = (dia) => {
    const bloques = porDia[dia];
    const ultimoFin = bloques.length ? hh(bloques[bloques.length - 1].hora_fin) : 9;
    const ini = ultimoFin + 1;
    const fin = Math.min(ini + 3, 23);
    if (ini >= fin) {
      alerta("No queda espacio para otro bloque ese día.", { tipo: "advertencia" });
      return;
    }
    cambiarDia(dia, [...bloques, { hora_inicio: fmt(ini), hora_fin: fmt(fin) }]);
  };

  const quitarBloque = (dia, i) => cambiarDia(dia, porDia[dia].filter((_, j) => j !== i));

  const horasSemana = porDia
    ? Object.values(porDia).reduce(
        (t, l) => t + l.reduce((s, b) => s + Math.max(0, hh(b.hora_fin) - hh(b.hora_inicio)), 0),
        0
      )
    : 0;

  const guardar = async () => {
    for (const d of DIAS) {
      const problema = errorDelDia(porDia[d.valor]);
      if (problema) {
        alerta(`${d.nombre}: ${problema}`, { tipo: "advertencia" });
        return;
      }
    }

    const bloques = DIAS.flatMap((d) =>
      porDia[d.valor].map((b) => ({ dia_semana: d.valor, hora_inicio: b.hora_inicio, hora_fin: b.hora_fin, activo: true }))
    );

    setGuardando(true);
    try {
      await updateAgenda(estudio.id_estudio, bloques);
      alerta("El horario se guardó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el horario.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  if (!cargandoSesion && !esGestor) {
    return (
      <div className="e0-page">
        <Navbar />
        <div className="e0-hero">
          <h1>Horarios</h1>
          <p>Solo los Fundadores/as pueden cambiar el horario del Estudio 0.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="e0-page">
      <Navbar />

      <div className="e0-hero">
        <button
          type="button"
          className="e0-volver"
          aria-label="Volver al Estudio 0"
          title="Volver al Estudio 0"
          onClick={() => navigate("/estudio0")}
        >
          <Icono icon={ArrowLeft} size={18} />
        </button>
        <h1>Horarios</h1>
        <p>Define qué días y entre qué horas se puede reservar. Cada bloque se reparte en horas de una hora.</p>
      </div>

      <main className="e0-agenda">
        {loading && <p className="e0-estado">Cargando horario...</p>}
        {error && <p className="e0-estado e0-estado-error">{error}</p>}

        {porDia && (
          <>
            <section className="e0-panel e0-semana" aria-label="Semana tipo">
              <span className="e0-cinta" aria-hidden="true" />
              <h2>Semana tipo</h2>

              {DIAS.map((d) => {
                const bloques = porDia[d.valor];
                const abierto = bloques.length > 0;
                return (
                  <div className="e0-fila-dia" key={d.valor}>
                    <label className="e0-interruptor">
                      <input type="checkbox" checked={abierto} onChange={() => alternarDia(d.valor)} />
                      <span className="e0-pastilla" aria-hidden="true" />
                      <b>{d.nombre}</b>
                    </label>

                    {!abierto && <span className="e0-cerrado">Cerrado: no se puede reservar este día.</span>}

                    {abierto && (
                      <div className="e0-bloques">
                        {bloques.map((b, i) => (
                          <div className="e0-bloque" key={i}>
                            <select aria-label={`${d.nombre}: desde`} value={b.hora_inicio} onChange={(e) => cambiarBloque(d.valor, i, "hora_inicio", e.target.value)}>
                              {HORAS_INICIO.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span>a</span>
                            <select aria-label={`${d.nombre}: hasta`} value={b.hora_fin} onChange={(e) => cambiarBloque(d.valor, i, "hora_fin", e.target.value)}>
                              {HORAS_FIN.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <small>{Math.max(0, hh(b.hora_fin) - hh(b.hora_inicio))} h</small>
                            <button type="button" className="e0-quitar" onClick={() => quitarBloque(d.valor, i)} aria-label={`Quitar bloque de ${d.nombre}`}>
                              ✕
                            </button>
                          </div>
                        ))}
                        <button type="button" className="e0-mas" onClick={() => agregarBloque(d.valor)}>
                          + bloque
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="e0-acciones">
                <button type="button" className="btn-primary" disabled={guardando} onClick={guardar}>
                  {guardando ? "Guardando..." : "Guardar horario"}
                </button>
              </div>
            </section>

            <aside className="e0-columna">
              <div className="e0-panel e0-resumen">
                <h2>Resumen</h2>
                <p>
                  El Estudio 0 queda abierto <b>{horasSemana} {horasSemana === 1 ? "hora" : "horas"}</b> por semana.
                </p>
                <p className="e0-ayuda">
                  Los días cerrados aparecen así en la agenda. Las reservas ya confirmadas se mantienen aunque
                  cambies el horario.
                </p>
              </div>
            </aside>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}