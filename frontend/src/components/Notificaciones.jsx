import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import { CircleCheck, CircleX, Heart, Lock, User, X } from "@sketchicon/lucide";
import Icono from "./Icono.jsx";
import {
  getMisNotificaciones,
  getContadorNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
} from "../services/notificaciones.services.js";
import "../styles/Notificaciones.css";

const INTERVALO_MS = 60 * 1000;

const ICONOS = {
  reserva_confirmada: CircleCheck,
  reserva_cancelada: CircleX,
  nuevo_seguidor: Heart,
  cambio_contrasena: Lock,
  cambio_correo: Lock,
  cambio_rol: Lock,
};

const formatoRelativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const hace = (fecha) => {
  const seg = Math.round((new Date(fecha).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seg);
  if (abs < 60) return "ahora";
  if (abs < 3600) return formatoRelativo.format(Math.round(seg / 60), "minute");
  if (abs < 86400) return formatoRelativo.format(Math.round(seg / 3600), "hour");
  return formatoRelativo.format(Math.round(seg / 86400), "day");
};

export default function Notificaciones() {
  const navigate = useNavigate();
  const contenedor = useRef(null);

  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  const cargarContador = useCallback(async () => {
    try {
      const { no_leidas } = await getContadorNotificaciones();
      setNoLeidas(no_leidas);
    } catch {
    }
  }, []);

  const cargarLista = useCallback(async () => {
    setCargando(true);
    setError(false);
    try {
      const data = await getMisNotificaciones({ limit: 20 });
      setLista(data.notificaciones);
      setNoLeidas(data.no_leidas);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarContador();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") cargarContador();
    }, INTERVALO_MS);
    const alVolver = () => document.visibilityState === "visible" && cargarContador();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargarContador]);

  useEffect(() => {
    if (abierto) cargarLista();
  }, [abierto, cargarLista]);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => contenedor.current && !contenedor.current.contains(e.target) && setAbierto(false);
    const tecla = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const abrirAviso = async (n) => {
    if (!n.leida) {
      setLista((l) => l.map((x) => (x.id_notificacion === n.id_notificacion ? { ...x, leida: true } : x)));
      setNoLeidas((c) => Math.max(0, c - 1));
      marcarNotificacionLeida(n.id_notificacion).catch(console.error);
    }
    setAbierto(false);
    if (n.enlace) navigate(n.enlace);
  };

  const marcarTodas = async () => {
    try {
      await marcarTodasLeidas();
      setLista((l) => l.map((x) => ({ ...x, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error(err);
    }
  };

  const quitar = async (e, n) => {
    e.stopPropagation();
    setLista((l) => l.filter((x) => x.id_notificacion !== n.id_notificacion));
    if (!n.leida) setNoLeidas((c) => Math.max(0, c - 1));
    try {
      await eliminarNotificacion(n.id_notificacion);
    } catch (err) {
      console.error(err);
      cargarLista();
    }
  };

  return (
    <div className="notif-wrap" ref={contenedor}>
      <button
        type="button"
        className="campana-btn notif-campana"
        aria-label={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"}
        aria-haspopup="true"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <IoIosNotifications size={24} />
        {noLeidas > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="notif-panel" role="dialog" aria-label="Notificaciones">
          <div className="notif-cabecera">
            <strong>Notificaciones</strong>
            <button type="button" className="notif-marcar" onClick={marcarTodas} disabled={noLeidas === 0}>
              Marcar todas como leídas
            </button>
          </div>

          <div className="notif-lista" aria-live="polite">
            {cargando && lista.length === 0 && <p className="notif-vacio">Cargando...</p>}
            {error && <p className="notif-vacio">No se pudieron cargar tus avisos.</p>}
            {!cargando && !error && lista.length === 0 && (
              <p className="notif-vacio">No tienes notificaciones por ahora.</p>
            )}

            {lista.map((n) => {
              const IconoTipo = ICONOS[n.tipo] || User;
              return (
                <div key={n.id_notificacion} className={`notif-item ${n.leida ? "" : "sin-leer"}`}>
                  <button type="button" className="notif-item-cuerpo" onClick={() => abrirAviso(n)}>
                    <span className="notif-icono">
                      <Icono icon={IconoTipo} size={18} />
                    </span>
                    <span className="notif-texto">
                      <strong>{n.titulo}</strong>
                      <span>{n.mensaje}</span>
                      <small>{hace(n.created_at)}</small>
                    </span>
                    {!n.leida && <span className="notif-punto" aria-label="Sin leer" />}
                  </button>
                  <button
                    type="button"
                    className="notif-quitar"
                    aria-label={`Eliminar notificación: ${n.titulo}`}
                    onClick={(e) => quitar(e, n)}
                  >
                    <Icono icon={X} size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}