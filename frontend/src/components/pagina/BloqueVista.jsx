import React from "react";
import Icono from "../Icono.jsx";
import { IconoHoja } from "./Iconos.js";
import { REDES } from "./Redes.jsx";
import { videoEmbedUrl } from "../../constants/paginaEstilos.js";
import { getImagenUrl } from "../../services/pagina.services.js";

const GIROS = ["-1.2deg", "0.9deg", "-0.6deg", "1.1deg", "-0.8deg", "0.7deg"];

export default function BloqueVista({ bloque }) {
  switch (bloque.tipo) {
    case "texto":
      if (!bloque.contenido?.trim()) return null;
      return <p className="bloque-texto">{bloque.contenido}</p>;

    case "imagen": {
      const url = getImagenUrl(bloque.url);
      if (!url) return null;
      const descripcion = bloque.alt?.trim();
      return (
        <figure className={`bloque-imagen ${descripcion ? "con-descripcion" : ""}`}>
          <img src={url} alt={descripcion || ""} />
          {descripcion && <figcaption className="bloque-descripcion">{descripcion}</figcaption>}
        </figure>
      );
    }

    case "galeria": {
      const fotos = (bloque.imagenes || []).filter(Boolean);
      if (fotos.length === 0) return null;
      return (
        <div className="bloque-galeria">
          {fotos.map((foto, i) => (
            <figure className="bloque-foto" key={foto} style={{ "--giro": GIROS[i % GIROS.length] }}>
              <img src={getImagenUrl(foto)} alt="" />
            </figure>
          ))}
        </div>
      );
    }

    case "separador":
      return (
        <div className="bloque-separador" role="separator">
          <span />
          <Icono icon={IconoHoja} size={22} />
          <span />
        </div>
      );

    case "redes": {
      const activas = REDES.filter((r) => bloque[r.clave]?.trim());
      if (activas.length === 0) return null;
      return (
        <div className="bloque-redes">
          {activas.map((r) => (
            <a
              key={r.clave}
              href={r.enlace(bloque[r.clave])}
              target={r.clave === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={r.label}
              title={r.label}
            >
              {r.icono(20)}
            </a>
          ))}
        </div>
      );
    }

    case "video": {
      const embed = videoEmbedUrl(bloque.url);
      if (!embed) return null;
      return (
        <div className="bloque-video">
          <iframe
            src={embed}
            title="Video"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }

    default:
      return null;
  }
}