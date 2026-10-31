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
import { textoSobre, detalleLegible } from "../constants/paginaEstilos.js";
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

  const acento = datos?.pagina.color_acento;
  const conFoto = Boolean(datos?.pagina.portada);
  const acentoOscuro = datos ? textoSobre(acento) === "#ffffff" : false;

  const tinta = conFoto || acentoOscuro ? "#ffffff" : "#2b1f15";
  const textoBoton = tinta === "#ffffff" ? detalleLegible(acento, "#ffffff") : "#ffffff";

  const colores = datos
    ? {
        backgroundColor: datos.pagina.color_fondo,
        "--acento": acento,
        "--texto-acento": textoSobre(acento),
        "--tinta": tinta,
        "--texto-boton": textoBoton,
      }
    : undefined;

  const clases = [
    "pagina-publica-page",
    datos && "con-pagina",
    conFoto && "con-foto", 
    datos && tinta === "#ffffff" && "cabecera-clara",
    datos && acentoOscuro && "pie-claro",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={clases} style={colores}>
      <div className="pagina-publica-cabecera">
        <Navbar />
      </div>

      {loading && <p className="estado-msg pagina-publica-estado">Cargando página...</p>}

      {!loading && error && (
        <div className="pagina-publica-estado">
          <p className="estado-msg estado-error">{error}</p>
          <Link to="/residentes" className="pagina-volver-simple">
            <Icono icon={ArrowLeft} size={18} /> Volver a residentes
          </Link>
        </div>
      )}

      {!loading && datos && (
        <PaginaLienzo
          estilo={datos.pagina}
          nombre={datos.residente.nombre}
          descripcion={datos.residente.descripcion}
          avatarUrl={datos.avatar ? getAvatarUrl(datos.avatar) : null}
          iniciales={iniciales}
          accionPortada={
            <Link to="/residentes" className="pagina-volver">
              <Icono icon={ArrowLeft} size={16} /> Residentes
            </Link>
          }
          onAgendar={proximamente("Agendar")}
          onSeguir={proximamente("Seguir")}
        >
          {datos.pagina.bloques.map((bloque) => (
            <BloqueVista key={bloque.id} bloque={bloque} />
          ))}
        </PaginaLienzo>
      )}

      <div className="pagina-publica-pie">
        <Footer />
      </div>
    </div>
  );
}