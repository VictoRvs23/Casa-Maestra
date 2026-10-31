import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import PaginaLienzo from "../components/pagina/PaginaLienzo.jsx";
import BloqueVista from "../components/pagina/BloqueVista.jsx";
import { ArrowLeft } from "@sketchicon/lucide";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getPaginaPublica } from "../services/pagina.services.js";
import { getAvatarUrl } from "../services/usuario.services.js";
import "../styles/pagina/PaginaResidente.css";

export default function PaginaResidente() {
  const { slug } = useParams();
  const { alerta } = useAlerta();

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    getPaginaPublica(slug)
      .then((data) => !cancelado && setDatos(data))
      .catch((err) => {
        if (cancelado) return;
        console.error(err);
        setError(
          err.response?.status === 404
            ? err.response.data?.message || "Esta página no está disponible."
            : "No se pudo cargar la página."
        );
      })
      .finally(() => !cancelado && setLoading(false));

    return () => {
      cancelado = true;
    };
  }, [slug]);

  const proximamente = (accion) => () =>
    alerta(`${accion} estará disponible muy pronto.`, { tipo: "info", titulo: "Próximamente" });

  const iniciales = datos
    ? datos.residente.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <div className="pagina-publica-page">
      <Navbar />

      <div className="pagina-publica-wrap">
        <Link to="/residentes" className="pagina-volver">
          <Icono icon={ArrowLeft} size={18} /> Volver a residentes
        </Link>

        {loading && <p className="estado-msg">Cargando página...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}

        {!loading && datos && (
          <PaginaLienzo
            estilo={datos.pagina}
            nombre={datos.residente.nombre}
            descripcion={datos.residente.descripcion}
            avatarUrl={datos.avatar ? getAvatarUrl(datos.avatar) : null}
            iniciales={iniciales}
            onAgendar={proximamente("Agendar")}
            onSeguir={proximamente("Seguir")}
          >
            {datos.pagina.bloques.map((bloque) => (
              <BloqueVista key={bloque.id} bloque={bloque} />
            ))}
          </PaginaLienzo>
        )}
      </div>

      <Footer />
    </div>
  );
}