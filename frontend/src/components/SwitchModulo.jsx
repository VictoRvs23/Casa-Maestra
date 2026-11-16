import React, { useState } from "react";
import { useAlerta } from "../context/AlertaContext.jsx";
import useSwitchModulo from "../hooks/useSwitchModulo.js";
import "../styles/SwitchModulo.css";

export default function SwitchModulo() {
  const { talleresHabilitado, cambiarTalleres } = useSwitchModulo();
  const { alerta, confirmar } = useAlerta();
  const [guardando, setGuardando] = useState(false);

  const alternar = async () => {
    const nuevo = !talleresHabilitado;
    const ok = await confirmar(
      nuevo
        ? "¿Habilitar el módulo de Talleres? Volverá a verse en la barra de navegación para todos."
        : "¿Deshabilitar el módulo de Talleres? Dejará de verse para el público y no se podrán hacer nuevos arriendos. El equipo seguirá viéndolo.",
      { textoConfirmar: nuevo ? "Habilitar" : "Deshabilitar" }
    );
    if (!ok) return;

    setGuardando(true);
    try {
      const r = await cambiarTalleres(nuevo);
      alerta(r.message, { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo cambiar el estado del módulo.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="switch-modulo">
      <span id="switch-modulo-etiqueta">
        Módulo de Talleres: <strong>{talleresHabilitado ? "habilitado" : "deshabilitado"}</strong>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={talleresHabilitado}
        aria-labelledby="switch-modulo-etiqueta"
        disabled={guardando}
        className={`switch-modulo-btn ${talleresHabilitado ? "activo" : ""}`}
        onClick={alternar}
      >
        <span />
      </button>
    </div>
  );
}
