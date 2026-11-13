import React from "react";
import { FaGripVertical } from "react-icons/fa";
import Icono from "../Icono.jsx";
import {
  IconoImagen,
  IconoHoja,
  IconoSubir,
  IconoBajar,
  IconoBorrar,
  IconoCerrar,
  IconoMas,
} from "./Iconos.js";
import { MAX_FOTOS_GALERIA, TIPOS_BLOQUE, TAMANOS_BLOQUE, MENSAJES_VIDEO, analizarVideo } from "../../constants/paginaEstilos.js";
import { getImagenUrl } from "../../services/pagina.services.js";
import { REDES } from "./Redes.jsx";

function SlotFoto({ url, clave, subiendoClave, onArchivo, onQuitar, className = "" }) {
  const imagen = getImagenUrl(url);
  const subiendo = subiendoClave === clave;

  return (
    <div className={`slot-foto ${imagen ? "con-imagen" : ""} ${className}`}>
      {imagen && <img src={imagen} alt="" className="slot-foto-img" />}

      <label className="slot-foto-label">
        <Icono icon={IconoImagen} size={26} />
        <span>{subiendo ? "Subiendo..." : imagen ? "Cambiar foto" : "Subir foto"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={subiendo}
          onChange={(e) => {
            const archivo = e.target.files[0];
            e.target.value = "";
            if (archivo) onArchivo(archivo);
          }}
        />
      </label>

      {onQuitar && (
        <button type="button" className="slot-foto-quitar" aria-label="Quitar" onClick={onQuitar}>
          <Icono icon={IconoCerrar} size={14} />
        </button>
      )}
    </div>
  );
}

function SelectorTamano({ valor = "grande", onCambiar }) {
  return (
    <div className="selector-tamano" role="radiogroup" aria-label="Tamaño del bloque">
      <span>Tamaño</span>
      {TAMANOS_BLOQUE.map((t) => (
        <button
          type="button"
          key={t.valor}
          role="radio"
          aria-checked={valor === t.valor}
          className={valor === t.valor ? "activo" : ""}
          onClick={() => onCambiar({ tamano: t.valor })}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function BloqueEditor({
  bloque,
  esPrimero,
  esUltimo,
  subiendoClave,
  onCambiar,
  onSubirImagen,
  onMover,
  onEliminar,
  arrastrando = false,
  sobre = false,
  onArrastrar,
  onArrastrarSobre,
  onSoltar,
  onTerminarArrastre,
}) {
  const etiqueta = TIPOS_BLOQUE.find((t) => t.tipo === bloque.tipo)?.label;

  const subirYGuardar = async (archivo, clave, aplicar) => {
    const url = await onSubirImagen(archivo, clave);
    if (url) onCambiar((actual) => aplicar(actual, url));
  };

  const contenido = () => {
    switch (bloque.tipo) {
      case "texto":
        return (
          <textarea
            className="bloque-textarea"
            aria-label="Texto del bloque"
            value={bloque.contenido}
            maxLength={1500}
            rows={4}
            placeholder="Cuenta quién eres, tu oficio o cómo trabajas..."
            onChange={(e) => onCambiar({ contenido: e.target.value })}
          />
        );

      case "imagen":
        return (
          <>
            <div className={`bloque-tam tam-${bloque.tamano || "grande"}`}>
            <SlotFoto
              url={bloque.url}
              clave={`${bloque.id}:imagen`}
              subiendoClave={subiendoClave}
              className="slot-grande"
              onArchivo={(archivo) => subirYGuardar(archivo, `${bloque.id}:imagen`, (_, url) => ({ url }))}
              onQuitar={bloque.url ? () => onCambiar({ url: null }) : undefined}
            />
            </div>
            <SelectorTamano valor={bloque.tamano} onCambiar={onCambiar} />
            <input
              type="text"
              className="bloque-alt"
              aria-label="Descripción de la imagen"
              placeholder="Descripción de la imagen (opcional). Ej: Rosa en línea fina, antebrazo"
              maxLength={120}
              value={bloque.alt}
              onChange={(e) => onCambiar({ alt: e.target.value })}
            />
          </>
        );

      case "galeria":
        return (
          <>
            <div className="bloque-galeria-editor">
              {bloque.imagenes.map((url, i) => {
                const clave = `${bloque.id}:${i}`;
                return (
                  <SlotFoto
                    key={clave}
                    url={url}
                    clave={clave}
                    subiendoClave={subiendoClave}
                    onArchivo={(archivo) =>
                      subirYGuardar(archivo, clave, (actual, nueva) => ({
                        imagenes: actual.imagenes.map((u, j) => (j === i ? nueva : u)),
                      }))
                    }
                    onQuitar={() => onCambiar((actual) => ({ imagenes: actual.imagenes.filter((_, j) => j !== i) }))}
                  />
                );
              })}
            </div>
            {bloque.imagenes.length < MAX_FOTOS_GALERIA && (
              <button
                type="button"
                className="bloque-agregar-foto"
                onClick={() => onCambiar((actual) => ({ imagenes: [...actual.imagenes, null] }))}
              >
                <Icono icon={IconoMas} size={16} /> Agregar espacio para otra foto
              </button>
            )}
          </>
        );

      case "separador":
        return (
          <div className="bloque-separador" role="separator">
            <span />
            <Icono icon={IconoHoja} size={22} />
            <span />
          </div>
        );

      case "redes":
        return (
          <div className="bloque-redes-editor">
            {REDES.map((r) => (
              <label key={r.clave}>
                {r.icono(18)}
                <span className="solo-lectores">{r.label}</span>
                <input
                  type={r.tipo}
                  placeholder={r.placeholder}
                  maxLength={r.max}
                  value={bloque[r.clave] || ""}
                  onChange={(e) => onCambiar({ [r.clave]: e.target.value })}
                />
              </label>
            ))}
          </div>
        );

      case "video": {
        const analisis = analizarVideo(bloque.url);
        const hayTexto = bloque.url?.trim();
        return (
          <>
            <input
              type="url"
              className="bloque-alt"
              aria-label="Enlace del video"
              placeholder="Pega aquí el enlace de YouTube, Vimeo, Instagram o TikTok"
              maxLength={300}
              value={bloque.url || ""}
              onChange={(e) => onCambiar({ url: e.target.value })}
            />
            {analisis.src ? (
              <div className={`bloque-tam tam-${bloque.tamano || "grande"}`}>
                <div className={`bloque-video formato-${analisis.formato}`}>
                  <iframe src={analisis.src} title="Vista previa del video" loading="lazy" allowFullScreen />
                </div>
              </div>
            ) : (
              <p className={`bloque-video-ayuda ${hayTexto ? "error" : ""}`}>
                {hayTexto
                  ? MENSAJES_VIDEO[analisis.motivo] || MENSAJES_VIDEO.invalido
                  : "Pega el enlace de tu video. Instagram y TikTok deben ser públicos."}
              </p>
            )}
            <SelectorTamano valor={bloque.tamano} onCambiar={onCambiar} />
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      id={`bloque-${bloque.id}`}
      className={`bloque-editor ${arrastrando ? "arrastrando" : ""} ${sobre ? "sobre" : ""}`}
      onDragOver={onArrastrarSobre}
      onDrop={onSoltar}
    >
      <span className="bloque-etiqueta">{etiqueta}</span>

      <div className="bloque-herramientas" role="group" aria-label={`Acciones del bloque ${etiqueta}`}>

        <span
          className="bloque-asa"
          title="Arrastra para cambiar de lugar"
          aria-hidden="true"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", bloque.id);
            const tarjeta = e.currentTarget.closest(".bloque-editor");
            if (tarjeta) e.dataTransfer.setDragImage(tarjeta, 24, 24);
            setTimeout(() => onArrastrar?.(), 0);
          }}
          onDragEnd={() => onTerminarArrastre?.()}
        >
          <FaGripVertical size={14} />
        </span>
        <button type="button" aria-label="Subir bloque" disabled={esPrimero} onClick={() => onMover(-1)}>
          <Icono icon={IconoSubir} size={16} />
        </button>
        <button type="button" aria-label="Bajar bloque" disabled={esUltimo} onClick={() => onMover(1)}>
          <Icono icon={IconoBajar} size={16} />
        </button>
        <button type="button" className="danger" aria-label="Eliminar bloque" onClick={onEliminar}>
          <Icono icon={IconoBorrar} size={16} />
        </button>
      </div>

      {contenido()}
    </div>
  );
}