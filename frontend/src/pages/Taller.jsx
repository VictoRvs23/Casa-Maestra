import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getTaller, getImagenUrl } from "../services/taller.services.js";
import { getAvatarUrl } from "../services/usuario.services.js";
import { ArrowLeft } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Taller.css";

const iniciales = (a) =>
  `${a.nombre?.[0] || ""}${a.apellido?.[0] || ""}`.toUpperCase() || "?";

export default function Taller() {
  const { id_taller } = useParams();
  const [taller, setTaller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    getTaller(id_taller)
      .then((data) => !cancelado && setTaller(data))
      .catch((err) => {
        if (cancelado) return;
        console.error(err);
        setError(
          err.response?.status === 404
            ? "Este taller no existe o fue eliminado."
            : "No se pudo cargar el taller."
        );
      })
      .finally(() => !cancelado && setLoading(false));

    return () => {
      cancelado = true;
    };
  }, [id_taller]);

  const imagen = taller ? getImagenUrl(taller.imagen) : null;

  return (
    <div className="taller-page">
      <Navbar />

      <div className="taller-wrap">
        <Link to="/" className="taller-volver">
          <Icono icon={ArrowLeft} size={18} /> Volver a los talleres
        </Link>

        {loading && <p className="estado-msg">Cargando taller...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}

        {!loading && taller && (
          <>
            <div
              className="taller-banner"
              style={imagen ? { backgroundImage: `url(${imagen})` } : undefined}
              role="img"
              aria-label={taller.nombre}
            />

            <h1 className="taller-titulo">{taller.nombre}</h1>

            <section className="taller-seccion">
              <h2>Sobre el taller</h2>
              <p className="taller-descripcion">
                {taller.descripcion || "Pronto compartiremos más información sobre este taller."}
              </p>
            </section>

            <section className="taller-seccion">
              <h2>Artistas</h2>
              {taller.artistas.length === 0 ? (
                <p className="taller-descripcion">Aún no hay artistas asignados a este taller.</p>
              ) : (
                <div className="artistas-grid">
                  {taller.artistas.map((a) => (
                    <div className="artista-card" key={a.id_usuario}>
                      {a.avatar ? (
                        <img
                          src={getAvatarUrl(a.avatar)}
                          alt={`${a.nombre} ${a.apellido}`}
                          className="artista-avatar"
                        />
                      ) : (
                        <div className="artista-avatar artista-avatar-iniciales">{iniciales(a)}</div>
                      )}
                      <h3>{a.nombre} {a.apellido}</h3>
                      <p>@{a.nombre_usuario}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}