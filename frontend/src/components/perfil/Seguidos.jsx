import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAlerta } from "../../context/AlertaContext.jsx";
import { getMisSeguidos, dejarDeSeguirResidente } from "../../services/seguidos.services.js";
import { getImagenUrl } from "../../services/residente.services.js";
import "../../styles/perfil/Seguidos.css";

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export default function Seguidos() {
  const { alerta } = useAlerta();
  const [seguidos, setSeguidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quitando, setQuitando] = useState(null);

  useEffect(() => {
    getMisSeguidos()
      .then(setSeguidos)
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar tus seguidos.");
      })
      .finally(() => setLoading(false));
  }, []);

  const dejarDeSeguir = async (residente) => {
    setQuitando(residente.id_residente);
    try {
      await dejarDeSeguirResidente(residente.id_residente);
      setSeguidos((lista) => lista.filter((s) => s.residente.id_residente !== residente.id_residente));
      alerta(`Dejaste de seguir a ${residente.nombre}.`, { tipo: "exito" });
    } catch (err) {
      alerta(err.response?.data?.message || "No se pudo dejar de seguir.", { tipo: "error" });
    } finally {
      setQuitando(null);
    }
  };

  return (
    <div className="seguidos">
      <h2>Seguidos</h2>
      <p className="perfil-sub">Revisa tus talleres y artistas favoritos</p>

      {loading && <p className="seguidos-estado">Cargando...</p>}
      {!loading && error && <p className="seguidos-estado seguidos-error">{error}</p>}

      {!loading && !error && seguidos.length === 0 && (
        <div className="seguidos-vacio">
          <p>Todavía no sigues a nadie.</p>
          <Link to="/residentes" className="seguido-ver">
            Conocer residentes
          </Link>
        </div>
      )}

      {!loading && !error && seguidos.length > 0 && (
        <ul className="seguidos-lista">
          {seguidos.map(({ id_seguimiento, residente }) => (
            <li key={id_seguimiento} className="seguido-item">
              <div className="seguido-info">
                {residente.imagen ? (
                  <img src={getImagenUrl(residente.imagen)} alt="" className="seguido-thumb" />
                ) : (
                  <div className="seguido-thumb seguido-thumb-inicial">{iniciales(residente.nombre)}</div>
                )}
                <div className="seguido-texto">
                  <span className="seguido-nombre">{residente.nombre}</span>
                  {residente.descripcion && <span className="seguido-desc">{residente.descripcion}</span>}
                </div>
              </div>

              <div className="seguido-acciones">
                <button
                  type="button"
                  className="seguido-quitar"
                  disabled={quitando === residente.id_residente}
                  onClick={() => dejarDeSeguir(residente)}
                >
                  Dejar de seguir
                </button>
                <Link to={`/residentes/${residente.slug}`} className="seguido-ver">
                  Ver
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}