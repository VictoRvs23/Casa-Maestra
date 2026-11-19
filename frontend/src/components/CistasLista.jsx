import React, { useMemo, useState } from "react";

const plata = (n) => (n === null || n === undefined ? "A convenir" : `$${Number(n).toLocaleString("es-CL")}`);
const fechaLarga = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

const ETIQUETA = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

const FILTROS = [
  { id: "pendientes", label: "Pendientes", vacio: "No tienes solicitudes pendientes." },
  { id: "proximas", label: "Próximas", vacio: "No hay citas aceptadas por venir." },
  { id: "historial", label: "Historial", vacio: "Aún no hay citas en el historial." },
];

const grupoDe = (c) => {
  if (c.estado === "pendiente" && !c.pasada) return "pendientes";
  if (c.estado === "aceptada" && !c.pasada) return "proximas";
  return "historial";
};

export default function CitasLista({ citas, vista, ocupada, onAceptar, onRechazar, onCancelar }) {
  const grupos = useMemo(() => {
    const g = { pendientes: [], proximas: [], historial: [] };
    const ordenadas = [...citas].sort((a, b) => {
      if (a.fecha && b.fecha) return `${a.fecha}${a.hora_inicio}`.localeCompare(`${b.fecha}${b.hora_inicio}`);
      return 0;
    });
    ordenadas.forEach((c) => g[grupoDe(c)].push(c));
    g.historial.reverse();
    return g;
  }, [citas]);

  const [filtro, setFiltro] = useState(() =>
    grupos.pendientes.length ? "pendientes" : grupos.proximas.length ? "proximas" : "pendientes"
  );

  const lista = grupos[filtro];

  return (
    <section aria-label="Citas">
      <div className="mc-filtros" role="tablist">
        {FILTROS.map((f) => (
          <button
            type="button"
            key={f.id}
            role="tab"
            aria-selected={filtro === f.id}
            className={`mc-filtro ${filtro === f.id ? "activo" : ""}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
            <span>{grupos[f.id].length}</span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="ma-panel ma-vacio">
          <p>{FILTROS.find((f) => f.id === filtro).vacio}</p>
        </div>
      ) : (
        <ul className="mc-lista">
          {lista.map((c) => (
            <li className={`mc-cita ${c.estado}`} key={c.id_cita}>
              <div className="mc-cuando">
                {c.fecha ? (
                  <>
                    <b>{fechaLarga(c.fecha)}</b>
                    <span>
                      {c.hora_inicio} a {c.hora_fin}
                    </span>
                  </>
                ) : (
                  <>
                    <b>Producto apartado</b>
                    <span>Entrega a coordinar</span>
                  </>
                )}
              </div>

              <div className="mc-detalle">
                <h3>{c.nombre_servicio}</h3>
                <p className="mc-meta">
                  {plata(c.precio)}
                  {vista === "residente" ? ` · ${c.cliente.nombre}` : c.residente ? ` · con ${c.residente.nombre}` : ""}
                </p>
                {c.nota && <p className="mc-nota">«{c.nota}»</p>}
                {vista === "residente" && c.estado === "aceptada" && (c.cliente.telefono || c.cliente.email) && (
                  <p className="mc-contacto">
                    Contacto: {[c.cliente.telefono, c.cliente.email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              <div className="mc-lado">
                <span className={`mc-estado ${c.estado}`}>{c.pasada && c.estado === "aceptada" ? "Realizada" : ETIQUETA[c.estado]}</span>

                {vista === "residente" && grupoDe(c) === "pendientes" && (
                  <div className="mc-botones">
                    <button type="button" className="btn-primary" disabled={ocupada} onClick={() => onAceptar(c)}>
                      Aceptar
                    </button>
                    <button type="button" className="btn-ghost" disabled={ocupada} onClick={() => onRechazar(c)}>
                      Rechazar
                    </button>
                  </div>
                )}

                {(grupoDe(c) === "proximas" || (vista === "cliente" && grupoDe(c) === "pendientes")) && (
                  <button type="button" className="mc-cancelar" disabled={ocupada} onClick={() => onCancelar(c)}>
                    Cancelar cita
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}