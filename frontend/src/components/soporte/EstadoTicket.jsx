import React from "react";
import { CLASE_ESTADO } from "../../constants/estadosTicket.js";

export default function EstadoTicket({ estado }) {
  return <span className={`estado-pill ${CLASE_ESTADO[estado] || ""}`}>{estado}</span>;
}

export const formatearFecha = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString("es-CL") : "";