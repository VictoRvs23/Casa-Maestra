import React from "react";
import "../../styles/perfil/Seguidos.css";

const SEGUIDOS_EJEMPLO = [
  { nombre: "BloodScale", color: "#2b241c" },
  { nombre: "Rumbo Ceramicas", color: "#2b241c" },
  { nombre: "Rincon Rosa", color: "#e8598c" },
];

export default function Seguidos() {
  return (
    <>
      <h2>Seguidos</h2>
      <p className="perfil-sub">Revisa tus talleres y artistas favoritos</p>

      <div className="lista-items">
        {SEGUIDOS_EJEMPLO.map((s, i) => (
          <div className="item-row" key={i}>
            <div className="item-left">
              <div className="item-thumb" style={{ background: s.color }} />
              <strong>{s.nombre}</strong>
            </div>
            <button className="btn-ver">Ver</button>
          </div>
        ))}
      </div>
    </>
  );
}