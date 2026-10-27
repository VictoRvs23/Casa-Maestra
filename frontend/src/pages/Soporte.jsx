import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import PreguntasFrecuentes from "../components/soporte/PreguntaFrecuente.jsx";
import MisTickets from "../components/soporte/MisTickets.jsx";
import RegistroTickets from "../components/soporte/RegistroTickets.jsx";
import "../styles/Soporte.css";

export default function Soporte() {
  const { user } = useAuth();
  const esEquipo = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const [tab, setTab] = useState("preguntas");

  const tabs = [{ id: "preguntas", label: "Preguntas frecuentes" }];
  if (user) {
    tabs.push({ id: "tickets", label: esEquipo ? "Tickets" : "Mis tickets" });
  }

  return (
    <div className="soporte-page">
      <Navbar />

      <div className="soporte-hero">
        <h1>Soporte</h1>
        <p>
          {esEquipo
            ? "Gestiona las preguntas frecuentes y los tickets de los usuarios"
            : "Resuelve tus dudas sobre reservas, pagos y tu cuenta"}
        </p>
      </div>

      <div className="soporte-wrap">
        {tabs.length > 1 && (
          <div className="soporte-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`soporte-tab ${tab === t.id ? "activo" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {tab === "preguntas" && <PreguntasFrecuentes puedeGestionar={esEquipo} />}
        {tab === "tickets" && user && (esEquipo ? <RegistroTickets /> : <MisTickets />)}

        {!user && (
          <p className="soporte-login-aviso">
            ¿No encontraste lo que buscabas? <Link to="/login">Inicia sesión</Link> para crear un ticket.
          </p>
        )}
      </div>
    </div>
  );
}