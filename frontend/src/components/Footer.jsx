import React from "react";
import { REDES_SOCIALES } from "../constants/redesSociales.js";
import "../styles/Tema.css";
import "../styles/Footer.css";

const esExterno = (url) => /^https?:\/\//i.test(url);

const Footer = () => (
  <footer className="pie-pagina">
    <div className="divisor-hojas" role="presentation" aria-hidden="true" />
    <nav className="pie-pagina-contenido" aria-label="Contacto y redes sociales">
      {REDES_SOCIALES.filter((r) => r.url).map(({ id, etiqueta, texto, icono: Icono, url }) => (
        <a
          key={id}
          href={url}
          className="pie-pagina-item pie-pagina-enlace"
          aria-label={texto ? `${etiqueta}: ${texto}` : etiqueta}
          title={etiqueta}
          {...(esExterno(url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <Icono size={20} aria-hidden="true" />
          {texto && <span>{texto}</span>}
        </a>
      ))}
    </nav>
  </footer>
);

export default Footer;