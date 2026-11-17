import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getDisponibilidad, reservarEstudio0, hoyEnChile } from "../services/estudio0.services.js";

import "../styles/Estudio0.css";

const MAX_HORAS = 8;
const MAX_SEGUIDAS = 4;
const MESES_ADELANTE = 6;

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const pad = (n) => String(n).padStart(2, "0");
const mesDe = (anio, mes) => `${anio}-${pad(mes + 1)}`;
const minutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const diaSemana = (fecha) => {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
const sumarHora = (hora) => `${pad(Math.floor((minutos(hora) + 60) / 60))}:${pad((minutos(hora) + 60) % 60)}`;
const etiquetaDia = (fecha) =>
  `${DIAS_LARGOS[diaSemana(fecha)]} ${Number(fecha.slice(8))} de ${NOMBRES_MES[Number(fecha.slice(5, 7)) - 1].toLowerCase()}`;

const armarRangos = (seleccion) => {
  const ordenadas = [...seleccion].sort((a, b) =>
    a.fecha === b.fecha ? minutos(a.hora) - minutos(b.hora) : a.fecha < b.fecha ? -1 : 1
  );
  const rangos = [];
  for (const { fecha, hora } of ordenadas) {
    const ultimo = rangos[rangos.length - 1];
    const seguida = ultimo && ultimo.fecha === fecha && ultimo.hora_fin === hora;
    const cabe = ultimo && minutos(ultimo.hora_fin) - minutos(ultimo.hora_inicio) < MAX_SEGUIDAS * 60;
    if (seguida && cabe) ultimo.hora_fin = sumarHora(hora);
    else rangos.push({ fecha, hora_inicio: hora, hora_fin: sumarHora(hora) });
  }
  return rangos;
};
const plata = (n) => `$${Number(n).toLocaleString("es-CL")}`;

export default function Estudio0Agenda() {
  const { user } = useAuth();
  const { alerta } = useAlerta();
  const navigate = useNavigate();

  const hoy = useMemo(() => hoyEnChile(), []);
  const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
  const [mes, setMes] = useState(Number(hoy.slice(5, 7)) - 1);

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fechaSel, setFechaSel] = useState(null);
  const [seleccion, setSeleccion] = useState([]);
  const [reservando, setReservando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDatos(await getDisponibilidad(mesDe(anio, mes)));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo cargar la agenda.");
    } finally {
      setLoading(false);
    }
  }, [anio, mes]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mesActualIdx = Number(hoy.slice(0, 4)) * 12 + Number(hoy.slice(5, 7)) - 1;
  const mesVistoIdx = anio * 12 + mes;
  const puedeIrAtras = mesVistoIdx > mesActualIdx;
  const puedeIrAdelante = mesVistoIdx < mesActualIdx + MESES_ADELANTE;

  const cambiarMes = (delta) => {
    const nuevo = mesVistoIdx + delta;
    setAnio(Math.floor(nuevo / 12));
    setMes(nuevo % 12);
    setFechaSel(null);
  };

  const diaDe = (fecha) => datos?.dias.find((d) => d.fecha === fecha);
  const libres = (dia) => dia.horas.filter((h) => h.estado === "libre").length;

  const celdas = useMemo(() => {
    if (!datos) return [];
    const primera = (diaSemana(datos.dias[0].fecha) + 6) % 7;
    const vacias = Array.from({ length: primera }, () => null);
    return [...vacias, ...datos.dias];
  }, [datos]);

  const diaElegido = fechaSel ? diaDe(fechaSel) : null;

  const elegirDia = (dia) => setFechaSel(dia.fecha);

  const estaElegida = (fecha, hora) => seleccion.some((s) => s.fecha === fecha && s.hora === hora);
  const cuantasEnDia = (fecha) => seleccion.filter((s) => s.fecha === fecha).length;

  const alternarHora = (fecha, hora) => {
    if (estaElegida(fecha, hora)) {
      setSeleccion(seleccion.filter((s) => !(s.fecha === fecha && s.hora === hora)));
      return;
    }
    if (seleccion.length >= MAX_HORAS) {
      alerta(`Puedes reservar hasta ${MAX_HORAS} horas por confirmación.`, { tipo: "advertencia" });
      return;
    }
    setSeleccion([...seleccion, { fecha, hora }]);
  };

  const quitarRango = (rango) =>
    setSeleccion(
      seleccion.filter(
        (s) => !(s.fecha === rango.fecha && minutos(s.hora) >= minutos(rango.hora_inicio) && minutos(s.hora) < minutos(rango.hora_fin))
      )
    );

  const rangos = useMemo(() => armarRangos(seleccion), [seleccion]);
  const horasElegidas = seleccion.length;

  const textoRango = (r) => `${etiquetaDia(r.fecha)}, ${r.hora_inicio} a ${r.hora_fin}`;
  const resumen = horasElegidas
    ? `${horasElegidas} ${horasElegidas === 1 ? "hora elegida" : "horas elegidas"}`
    : "Aún no eliges horas";

  const confirmar = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setReservando(true);
    try {
      await reservarEstudio0(rangos.length === 1 ? rangos[0] : { reservas: rangos });
      alerta(
        rangos.length === 1
          ? `Tu reserva quedó confirmada: ${textoRango(rangos[0])}.`
          : `Quedaron confirmadas ${horasElegidas} horas en ${rangos.length} reservas.`,
        { tipo: "exito", titulo: rangos.length === 1 ? "Reserva confirmada" : "Reservas confirmadas" }
      );
      setSeleccion([]);
      cargar();
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo crear la reserva.", { tipo: "error" });
      if (err.response?.status === 409) {
        setSeleccion([]);
        cargar();
      }
    } finally {
      setReservando(false);
    }
  };

  return (
    <div className="e0-page">
      <Navbar />

      <div className="e0-hero">
        <button type="button" className="e0-volver" onClick={() => navigate("/taller0")}>
          ← Volver al Taller 0
        </button>
        <h1>Agenda</h1>
        <p>
          Elige las horas que necesitas; puedes sumar horas de distintos días.
          {datos ? ` Cada hora cuesta ${plata(datos.precio)}.` : ""}
        </p>
      </div>

      <main className="e0-agenda">
        {error && <p className="e0-estado e0-estado-error">{error}</p>}

        {/* Calendario */}
        <section className="e0-panel" aria-label="Calendario">
          <span className="e0-cinta" aria-hidden="true" />
          <div className="e0-cal-cabecera">
            <button type="button" className="e0-flecha" disabled={!puedeIrAtras} onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
              ‹
            </button>
            <h2>{NOMBRES_MES[mes]} {anio}</h2>
            <button type="button" className="e0-flecha" disabled={!puedeIrAdelante} onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
              ›
            </button>
          </div>

          <div className="e0-cal-semana">
            {DIAS_CORTOS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className={`e0-cal-grid ${loading ? "cargando" : ""}`}>
            {celdas.map((dia, i) => {
              if (!dia) return <span key={`v${i}`} />;
              const n = libres(dia);
              const pasado = dia.fecha < hoy;
              const deshabilitado = !dia.abierto || n === 0;
              const sub = !dia.abierto ? "cerrado" : pasado ? "" : n === 0 ? "completo" : `${n} ${n === 1 ? "libre" : "libres"}`;
              return (
                <button
                  key={dia.fecha}
                  type="button"
                  disabled={deshabilitado}
                  className={`e0-dia ${fechaSel === dia.fecha ? "elegido" : ""} ${!dia.abierto ? "cerrado" : ""} ${cuantasEnDia(dia.fecha) ? "con-seleccion" : ""}`}
                  onClick={() => elegirDia(dia)}
                  aria-label={`${DIAS_LARGOS[diaSemana(dia.fecha)]} ${Number(dia.fecha.slice(8))}${sub ? `, ${sub}` : ""}`}
                >
                  <b>{Number(dia.fecha.slice(8))}</b>
                  <small>{cuantasEnDia(dia.fecha) ? `${cuantasEnDia(dia.fecha)} elegida${cuantasEnDia(dia.fecha) === 1 ? "" : "s"}` : sub}</small>
                </button>
              );
            })}
          </div>

          <div className="e0-leyenda">
            <span><i className="libre" /> Con horas libres</span>
            <span><i className="elegido" /> Día elegido</span>
            <span><i className="cerrado" /> Cerrado</span>
          </div>
        </section>

        {/* Horas y resumen */}
        <section className="e0-columna" aria-label="Horas del día">
          <div className="e0-panel">
            {!diaElegido ? (
              <p className="e0-vacio">Elige un día del calendario para ver sus horas.</p>
            ) : (
              <>
                <h2>{etiquetaDia(fechaSel)}</h2>
                <p className="e0-ayuda">Toca todas las horas que quieras (hasta {MAX_HORAS} en total).</p>

                <div className="e0-horas">
                  {diaElegido.horas.map((h) => {
                    const elegida = estaElegida(fechaSel, h.hora_inicio);
                    return (
                      <button
                        key={h.hora_inicio}
                        type="button"
                        disabled={h.estado !== "libre"}
                        className={`e0-hora ${h.estado} ${elegida ? "elegida" : ""}`}
                        aria-pressed={elegida}
                        onClick={() => alternarHora(fechaSel, h.hora_inicio)}
                      >
                        {h.hora_inicio} – {h.hora_fin}
                      </button>
                    );
                  })}
                </div>

                <div className="e0-leyenda">
                  <span><i className="libre" /> Libre</span>
                  <span><i className="seleccion" /> Tu selección</span>
                  <span><i className="ocupada" /> Ocupada</span>
                </div>
              </>
            )}
          </div>

          <div className="e0-panel e0-resumen">
            <div className="e0-resumen-fila">
              <strong>{resumen}</strong>
              <span className="e0-total">{plata(horasElegidas * (datos?.precio || 0))}</span>
            </div>
            {rangos.length > 0 && (
              <ul className="e0-seleccion-lista">
                {rangos.map((r) => (
                  <li key={`${r.fecha}-${r.hora_inicio}`}>
                    <span>{textoRango(r)}</span>
                    <button type="button" onClick={() => quitarRango(r)} aria-label={`Quitar ${textoRango(r)}`}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="btn-primary"
              disabled={horasElegidas === 0 || reservando || (datos && !datos.disponible)}
              onClick={confirmar}
            >
              {!user ? "Inicia sesión para reservar" : reservando ? "Reservando..." : "Confirmar reserva"}
            </button>
            {datos && !datos.disponible && <small className="e0-ayuda">El Taller 0 no acepta reservas por ahora.</small>}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}