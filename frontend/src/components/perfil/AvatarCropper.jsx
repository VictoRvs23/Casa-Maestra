import React, { useState, useRef, useCallback } from "react";
import "../../styles/perfil/AvatarCropper.css";

const CONTAINER_SIZE = 260;
const OUTPUT_SIZE = 400;

export default function AvatarCropper({ imageSrc, onCancel, onConfirm }) {
  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);

  const scale = baseScale * zoom;

  const clampOffset = useCallback((off, currentScale) => {
    if (!naturalSize) return off;
    const dispW = naturalSize.width * currentScale;
    const dispH = naturalSize.height * currentScale;
    const minX = CONTAINER_SIZE - dispW;
    const minY = CONTAINER_SIZE - dispH;
    return {
      x: Math.min(0, Math.max(minX, off.x)),
      y: Math.min(0, Math.max(minY, off.y)),
    };
  }, [naturalSize]);

  const handleImgLoad = () => {
    const img = imgRef.current;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cover = Math.max(CONTAINER_SIZE / w, CONTAINER_SIZE / h);
    setNaturalSize({ width: w, height: h });
    setBaseScale(cover);
    const dispW = w * cover;
    const dispH = h * cover;
    setOffset({ x: (CONTAINER_SIZE - dispW) / 2, y: (CONTAINER_SIZE - dispH) / 2 });
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
    const nuevo = {
      x: dragState.current.offsetStart.x + dx,
      y: dragState.current.offsetStart.y + dy,
    };
    setOffset(clampOffset(nuevo, scale));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleConfirmar = () => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = CONTAINER_SIZE / scale;

    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-box">
        <h2>Ajusta tu foto</h2>
        <p className="cropper-sub">Arrastra para mover, usa la barra para acercar</p>

        <div
          className="cropper-viewport"
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
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
          <div className="cropper-circle-mask" />
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
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}