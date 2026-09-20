import React from "react";
import "../../styles/perfil/MisReservas.css";

const RESERVAS_EJEMPLO = [
  { nombre: "BloodScale", hora: "14:00 hrs", estado: "Próxima", color: "#2b241c" },
  { nombre: "Rumbo Ceramicas", hora: "16:00 hrs", estado: "Completada", color: "#2b241c" },
  { nombre: "Rincon Rosa", hora: "18:00 hrs", estado: "Cancelada", color: "#e8598c" },
];

export default function MisReservas() {
  return (
    <>
      <h2>Mis Reservas</h2>
      <p className="perfil-sub">Historial de talleres reservados</p>

      <div className="lista-items">
        {RESERVAS_EJEMPLO.map((r, i) => (
          <div className="item-row" key={i}>
            <div className="item-left">
              <div className="item-thumb" style={{ background: r.color }} />
              <div>
                <strong>{r.nombre}</strong>
                <div className="item-sub">Reserva de hora: {r.hora}</div>
              </div>
            </div>
            <span className={`estado-pill estado-${r.estado.toLowerCase()}`}>{r.estado}</span>
          </div>
        ))}
      </div>
    </>
  );
}