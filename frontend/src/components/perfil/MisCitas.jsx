import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlerta } from "../../context/AlertaContext.jsx";
import { getMisCitas, cancelarCita } from "../../services/agendaResidente.services.js";
import "../../styles/perfil/MisCitas.css";

const fechaLarga = (fecha) =>
  new Date(`${fecha}T12:00:00`)
    .toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "");

const plata = (n) => (n === null || n === undefined ? "A convenir" : `$${Number(n).toLocaleString("es-CL")}`);

const estadoDe = (c) => {
  if (c.estado === "pendiente") return c.pasada ? { texto: "Sin respuesta", clase: "estado-cancelada" } : { texto: "Pendiente", clase: "estado-próxima" };
  if (c.estado === "aceptada") return c.pasada ? { texto: "Realizada", clase: "estado-completada" } : { texto: "Aceptada", clase: "estado-próxima" };
  if (c.estado === "rechazada") return { texto: "Rechazada", clase: "estado-cancelada" };
  return { texto: "Cancelada", clase: "estado-cancelada" };
};

const COLOR = { pendiente: "#8c8271", aceptada: "#4a8a72", rechazada: "#a8452c", cancelada: "#a8452c" };

const vigente = (c) => (c.estado === "pendiente" || c.estado === "aceptada") && !c.pasada;

export default function MisCitas() {
  const { alerta, confirmar } = useAlerta();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ocupada, setOcupada] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const data = await getMisCitas();
      setCitas(data.citas);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudieron cargar tus citas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ordenadas = useMemo(() => {
    const clave = (c) => `${c.fecha || "9999-99-99"}${c.hora_inicio || ""}`;
    const vigentes = citas.filter(vigente).sort((a, b) => clave(a).localeCompare(clave(b)));
    const historial = citas.filter((c) => !vigente(c)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return [...vigentes, ...historial];
  }, [citas]);

  const handleCancelar = async (c) => {
    const ok = await confirmar(`¿Cancelar «${c.nombre_servicio}»? Le avisaremos al residente.`, {
      textoConfirmar: "Cancelar cita",
    });
    if (!ok) return;
    setOcupada(true);
    try {
      await cancelarCita(c.id_cita);
      await cargar();
      alerta("Se canceló la cita.", { tipo: "exito" });
    } catch (err) {
      alerta(err.response?.data?.message || "No se pudo cancelar.", { tipo: "error" });
    } finally {
      setOcupada(false);
    }
  };

  return (
    <>
      <h2>Mis Citas</h2>
      <p className="perfil-sub">Las horas y productos que pediste a los residentes</p>

      {cargando && <p className="perfil-sub">Cargando tus citas...</p>}
      {!cargando && error && <p className="perfil-sub">{error}</p>}

      {!cargando && !error && ordenadas.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", padding: "2.5rem 1rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "1rem", color: "var(--cafe-oscuro, #3b2a1d)" }}>
            Aún no has agendado nada. Busca a un residente y pide tu primera hora o producto.
          </p>
          <button
            type="button"
            onClick={() => navigate("/residentes")}
            style={{
              padding: "0.5rem 1.2rem",
              font: "inherit",
              fontSize: "0.81rem",
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#fff",
              background: "var(--cafe, #845736)",
              border: 0,
              borderRadius: 999,
              boxShadow: "none",
              cursor: "pointer",
            }}
          >
            Conocer residentes
          </button>
        </div>
      )}

      {!cargando && !error && ordenadas.length > 0 && (
        <div className="lista-items">
          {ordenadas.map((c) => {
            const estado = estadoDe(c);
            return (
              <div className="item-row" key={c.id_cita}>
                <div className="item-left">
                  <div
                    className="item-thumb"
                    style={{
                      background: COLOR[c.estado] || "#8c8271",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                    aria-hidden="true"
                  >
                    {(c.residente?.nombre || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong>{c.nombre_servicio}</strong>
                    <div className="item-sub">
                      {c.residente ? (
                        <>
                          con <Link to={`/residentes/${c.residente.slug}`}>{c.residente.nombre}</Link> ·{" "}
                        </>
                      ) : null}
                      {c.fecha ? `${fechaLarga(c.fecha)}, ${c.hora_inicio} a ${c.hora_fin}` : "Producto apartado, entrega a coordinar"}
                      {" · "}
                      {plata(c.precio)}
                    </div>
                    {c.nota && <div className="item-sub">«{c.nota}»</div>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                  <span className={`estado-pill ${estado.clase}`}>{estado.texto}</span>
                  {vigente(c) && (
                    <button
                      type="button"
                      className="item-cancelar"
                      disabled={ocupada}
                      onClick={() => handleCancelar(c)}
                      style={{
                        padding: 0,
                        font: "inherit",
                        fontSize: "0.8rem",
                        color: "#a8452c",
                        background: "none",
                        border: 0,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}