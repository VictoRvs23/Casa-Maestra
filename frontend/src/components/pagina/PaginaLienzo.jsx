import React from "react";
import { FUENTES, FUENTE_POR_DEFECTO, textoSobre, detalleLegible } from "../../constants/paginaEstilos.js";
import { getImagenUrl } from "../../services/pagina.services.js";
import "../../styles/pagina/PaginaLienzo.css";

export default function PaginaLienzo({
  estilo,
  nombre,
  descripcion,
  avatarUrl,
  iniciales,
  editor = false,
  accionPortada = null,
  accionAvatar = null,
  onAgendar,
  onSeguir,
  children,
}) {
  const fuente = FUENTES[estilo.fuente] || FUENTES[FUENTE_POR_DEFECTO];
  const portada = getImagenUrl(estilo.portada);
  const Titulo = editor ? "h3" : "h1";
  
  const detalle = detalleLegible(estilo.color_acento, estilo.color_fondo);

  const variables = {
    "--acento": estilo.color_acento,
    "--texto-acento": textoSobre(estilo.color_acento),
    "--detalle": detalle,
    "--texto-detalle": textoSobre(detalle),
    "--fondo-pagina": estilo.color_fondo,
    fontFamily: fuente.family,
  };

  return (
    <div className={`pagina-lienzo ${editor ? "pagina-lienzo-editor" : ""}`} style={variables}>
      <div className="pagina-portada" style={portada ? { backgroundImage: `url(${portada})` } : undefined}>
        {accionPortada}
      </div>

      <div className="pagina-cuerpo">
        <div className="pagina-cabecera">
          <div className="pagina-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={`Foto de ${nombre}`} className="pagina-avatar pagina-avatar-img" />
            ) : (
              <div className="pagina-avatar">{iniciales}</div>
            )}
            {accionAvatar}
          </div>

          <div className="pagina-identidad">
            <Titulo className="pagina-nombre">{nombre}</Titulo>
            {descripcion && <p className="pagina-categoria">{descripcion}</p>}
          </div>

          <div className="pagina-acciones">
            <button type="button" className="pagina-btn pagina-btn-lleno" onClick={onAgendar} disabled={!onAgendar}>
              Agendar
            </button>
            <button type="button" className="pagina-btn pagina-btn-borde" onClick={onSeguir} disabled={!onSeguir}>
              Seguir
            </button>
          </div>
        </div>

        <div className="pagina-bloques">{children}</div>
      </div>
    </div>
  );
}