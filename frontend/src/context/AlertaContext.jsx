import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/Alerta.css";

const AlertContext = createContext(null);

const TITULOS = {
  exito: "¡Listo!",
  error: "Ups, algo salió mal",
  advertencia: "Atención",
  info: "Aviso",
  peligro: "¿Estás seguro?",
};

const ICONOS = {
  exito: <path d="M20 6 9 17l-5-5" />,
  error: <path d="M18 6 6 18M6 6l12 12" />,
  advertencia: <path d="M12 8v5M12 17h.01" />,
  info: <path d="M12 11v6M12 7h.01" />,
  peligro: <path d="M12 8v5M12 17h.01" />,
};

export function AlertaProvider({ children }) {
  const [cola, setCola] = useState([]);
  const botonRef = useRef(null);
  const actual = cola[0];

  const encolar = useCallback((datos) => {
    return new Promise((resolve) => {
      setCola((c) => [...c, { ...datos, resolve }]);
    });
  }, []);

  const alerta = useCallback(
    (mensaje, { tipo = "info", titulo, textoAceptar = "Aceptar" } = {}) =>
      encolar({ mensaje, tipo, titulo: titulo || TITULOS[tipo], textoAceptar, confirmable: false }),
    [encolar]
  );

  const confirmar = useCallback(
    (mensaje, { tipo = "peligro", titulo, textoConfirmar = "Confirmar", textoCancelar = "Cancelar" } = {}) =>
      encolar({
        mensaje,
        tipo,
        titulo: titulo || TITULOS[tipo],
        textoAceptar: textoConfirmar,
        textoCancelar,
        confirmable: true,
      }),
    [encolar]
  );

  const cerrar = useCallback(
    (valor) => {
      if (!actual) return;
      actual.resolve(valor);
      setCola((c) => c.slice(1));
    },
    [actual]
  );

  useEffect(() => {
    if (!actual) return undefined;
    botonRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") cerrar(actual.confirmable ? false : undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actual, cerrar]);

  return (
    <AlertContext.Provider value={{ alerta, confirmar }}>
      {children}

      {actual && (
        <div
          className="alerta-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrar(actual.confirmable ? false : undefined)}
        >
          <div className={`alerta-box alerta-${actual.tipo}`} role="alertdialog" aria-modal="true" aria-labelledby="alerta-titulo">
            <div className="alerta-icono">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONOS[actual.tipo] || ICONOS.info}
              </svg>
            </div>

            <h2 id="alerta-titulo" className="alerta-titulo">{actual.titulo}</h2>
            <p className="alerta-mensaje">{actual.mensaje}</p>

            <div className="alerta-acciones">
              {actual.confirmable && (
                <button type="button" className="alerta-btn alerta-btn-ghost" onClick={() => cerrar(false)}>
                  {actual.textoCancelar}
                </button>
              )}
              <button
                type="button"
                ref={botonRef}
                className="alerta-btn alerta-btn-primary"
                onClick={() => cerrar(actual.confirmable ? true : undefined)}
              >
                {actual.textoAceptar}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlerta() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlerta debe usarse dentro de <AlertProvider>");
  return ctx;
}