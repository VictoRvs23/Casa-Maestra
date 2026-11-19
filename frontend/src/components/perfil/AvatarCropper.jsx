import React, { useState, useRef, useCallback } from "react";
import "../../styles/perfil/AvatarCropper.css";

export default function AvatarCropper({
  imageSrc,
  onCancel,
  onConfirm,
  aspect = 1,
  circular = true,
  anchoSalida = 400,
  titulo = "Ajusta tu foto",
  textoConfirmar = "Confirmar cambio",
}) {
  const imgRef = useRef(null);
  const viewportRef = useRef(null);
  const [caja, setCaja] = useState(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);

  const scale = baseScale * zoom;
  const ancho = aspect > 1 ? 1000 : 720;

  const clampOffset = useCallback(
    (off, currentScale) => {
      if (!naturalSize || !caja) return off;
      const minX = caja.w - naturalSize.width * currentScale;
      const minY = caja.h - naturalSize.height * currentScale;
      return {
        x: Math.min(0, Math.max(minX, off.x)),
        y: Math.min(0, Math.max(minY, off.y)),
      };
    },
    [naturalSize, caja]
  );

  const handleImgLoad = () => {
    const img = imgRef.current;
    const vp = viewportRef.current;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const medida = { w: vp.clientWidth, h: vp.clientHeight };
    const cover = Math.max(medida.w / w, medida.h / h);
    setCaja(medida);
    setNaturalSize({ width: w, height: h });
    setBaseScale(cover);
    setOffset({ x: (medida.w - w * cover) / 2, y: (medida.h - h * cover) / 2 });
  };

  const handleZoomChange = (e) => {
    const nuevoZoom = Number(e.target.value);
    setZoom(nuevoZoom);
    setOffset((prev) => clampOffset(prev, baseScale * nuevoZoom));
  };

  const handlePointerDown = (e) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, offsetStart: offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clampOffset({ x: dragState.current.offsetStart.x + dx, y: dragState.current.offsetStart.y + dy }, scale));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleConfirmar = () => {
    const canvas = document.createElement("canvas");
    canvas.width = anchoSalida;
    canvas.height = Math.round(anchoSalida / aspect);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imgRef.current,
      -offset.x / scale,
      -offset.y / scale,
      caja.w / scale,
      caja.h / scale,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-box" style={{ maxWidth: ancho }}>
        <h2>{titulo}</h2>
        <p className="cropper-sub">Arrastra para mover, usa la barra para acercar</p>

        <div
          ref={viewportRef}
          className={`cropper-viewport ${circular ? "" : "rectangular"}`}
          style={{ aspectRatio: aspect, maxWidth: aspect > 1 ? `min(100%, ${Math.round(aspect * 50)}vh)` : 340 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Imagen a recortar"
            onLoad={handleImgLoad}
            draggable={false}
            style={{
              position: "absolute",
              left: offset.x,
              top: offset.y,
              width: naturalSize ? naturalSize.width * scale : "auto",
              height: naturalSize ? naturalSize.height * scale : "auto",
              maxWidth: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
          {circular && <div className="cropper-circle-mask" />}
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={handleZoomChange}
          className="cropper-zoom"
          disabled={!naturalSize}
        />

        <div className="cropper-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleConfirmar} disabled={!naturalSize}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}