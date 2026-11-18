import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import { Pencil, Trash2 } from "@sketchicon/lucide";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getImagenUrl } from "../services/pagina.services.js";
import {
  getMisServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  getMisHorarios,
  guardarMisHorarios,
} from "../services/agendaResidente.services.js";

import "../styles/MiAgenda.css";

const PESTANAS = [
  { id: "servicios", label: "Servicios y productos" },
  { id: "horarios", label: "Horarios" },
];

const DIAS = [
  { n: 1, nombre: "Lunes" },
  { n: 2, nombre: "Martes" },
  { n: 3, nombre: "Miércoles" },
  { n: 4, nombre: "Jueves" },
  { n: 5, nombre: "Viernes" },
  { n: 6, nombre: "Sábado" },
  { n: 0, nombre: "Domingo" },
];

const pad = (n) => String(n).padStart(2, "0");
const HORAS = Array.from({ length: 36 }, (_, i) => `${pad(6 + Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`);
const DURACIONES = Array.from({ length: 32 }, (_, i) => (i + 1) * 15);

const minutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const textoDuracion = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} ${h === 1 ? "hora" : "horas"}`;
};
const plata = (n) => (n === null || n === undefined ? "A convenir" : `$${Number(n).toLocaleString("es-CL")}`);

const FORM_VACIO = {
  tipo: "servicio",
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_min: 60,
  activo: true,
};

export default function MiAgenda() {
  const { user, loading: cargandoSesion } = useAuth();
  const { alerta, confirmar } = useAlerta();

  const [pestana, setPestana] = useState("servicios");

  const [servicios, setServicios] = useState([]);
  const [maximo, setMaximo] = useState(30);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [quitarImagen, setQuitarImagen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [bloques, setBloques] = useState([]);
  const [original, setOriginal] = useState("[]");
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([getMisServicios(), getMisHorarios()]);
      setServicios(s.servicios);
      setMaximo(s.maximo);
      setBloques(h.bloques);
      setOriginal(JSON.stringify(h.bloques));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo cargar tu agenda.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!cargandoSesion && user?.rol === "Residente") cargar();
  }, [cargandoSesion, user, cargar]);

  const hayCambiosHorarios = useMemo(() => JSON.stringify(bloques) !== original, [bloques, original]);

  if (cargandoSesion) return null;
  if (!user || user.rol !== "Residente") return <Navigate to="/" replace />;

  const abrirCrear = () => {
    setEditandoId(null);
    setForm({ ...FORM_VACIO });
    setImagen(null);
    setQuitarImagen(false);
  };

  const abrirEditar = (s) => {
    setEditandoId(s.id_servicio);
    setForm({
      tipo: s.tipo,
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: s.precio === null ? "" : String(s.precio),
      duracion_min: s.duracion_min || 60,
      activo: s.activo,
    });
    setImagen(null);
    setQuitarImagen(false);
  };

  const cerrarModal = () => {
    setForm(null);
    setEditandoId(null);
    setImagen(null);
  };

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const elegirImagen = (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
      alerta("Solo se permiten imágenes JPG, PNG o WEBP.", { tipo: "advertencia" });
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      alerta("La imagen no puede pesar más de 5 MB.", { tipo: "advertencia" });
      return;
    }
    setImagen(archivo);
    setQuitarImagen(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const fd = new FormData();
    fd.append("tipo", form.tipo);
    fd.append("nombre", form.nombre);
    fd.append("descripcion", form.descripcion);
    fd.append("precio", form.precio);
    if (form.tipo === "servicio") fd.append("duracion_min", form.duracion_min);
    fd.append("activo", form.activo);
    if (imagen) fd.append("imagen", imagen);
    if (quitarImagen && !imagen) fd.append("quitar_imagen", "true");

    try {
      if (editandoId) await actualizarServicio(editandoId, fd);
      else await crearServicio(fd);
      cerrarModal();
      const data = await getMisServicios();
      setServicios(data.servicios);
      alerta(editandoId ? "Se guardaron los cambios." : "Se agregó a tu oferta.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      const detalle = err.response?.data?.errors?.[0] || err.response?.data?.message;
      alerta(detalle || "No se pudo guardar.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (s) => {
    const ok = await confirmar(`¿Eliminar «${s.nombre}»? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await eliminarServicio(s.id_servicio);
      setServicios((lista) => lista.filter((x) => x.id_servicio !== s.id_servicio));
      alerta("Se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo eliminar.", { tipo: "error" });
    }
  };

  const bloquesDe = (dia) =>
    bloques
      .map((b, i) => ({ ...b, i }))
      .filter((b) => b.dia_semana === dia)
      .sort((a, b) => minutos(a.hora_inicio) - minutos(b.hora_inicio));

  const alternarDia = (dia) => {
    if (bloquesDe(dia).length > 0) setBloques(bloques.filter((b) => b.dia_semana !== dia));
    else setBloques([...bloques, { dia_semana: dia, hora_inicio: "10:00", hora_fin: "18:00" }]);
  };

  const agregarBloque = (dia) => {
    const ultimos = bloquesDe(dia);
    const ultimo = ultimos[ultimos.length - 1];
    const inicio = ultimo ? ultimo.hora_fin : "10:00";
    const idx = HORAS.indexOf(inicio);
    const fin = HORAS[Math.min(idx + 4, HORAS.length - 1)] || "18:00";
    if (minutos(fin) <= minutos(inicio)) {
      alerta("No queda espacio en el día para otro bloque.", { tipo: "advertencia" });
      return;
    }
    setBloques([...bloques, { dia_semana: dia, hora_inicio: inicio, hora_fin: fin }]);
  };

  const cambiarBloque = (i, campo, valor) =>
    setBloques(bloques.map((b, j) => (j === i ? { ...b, [campo]: valor } : b)));

  const quitarBloque = (i) => setBloques(bloques.filter((_, j) => j !== i));

  const handleGuardarHorarios = async () => {
    setGuardandoHorarios(true);
    try {
      const data = await guardarMisHorarios(bloques);
      setBloques(data.bloques);
      setOriginal(JSON.stringify(data.bloques));
      alerta("Tus horarios se guardaron.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      const detalle = err.response?.data?.errors?.[0] || err.response?.data?.message;
      alerta(detalle || "No se pudieron guardar los horarios.", { tipo: "error" });
    } finally {
      setGuardandoHorarios(false);
    }
  };

  const imagenActual = editandoId ? servicios.find((s) => s.id_servicio === editandoId)?.imagen : null;

  return (
    <div className="ma-page">
      <Navbar />

      <div className="ma-hero">
        <h1>Mi agenda</h1>
        <p>Define qué ofreces y cuándo atiendes. Tus clientes agendarán eligiendo uno de tus servicios o productos.</p>
        <Link to="/mi-pagina" className="ma-link">Ir a Mi página</Link>
      </div>

      <main className="ma-main">
        <div className="ma-tabs" role="tablist" aria-label="Secciones de mi agenda">
          {PESTANAS.map((p) => (
            <button
              type="button"
              key={p.id}
              role="tab"
              aria-selected={pestana === p.id}
              className={`ma-tab ${pestana === p.id ? "activo" : ""}`}
              onClick={() => setPestana(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {cargando && <p className="ma-estado">Cargando tu agenda...</p>}
        {!cargando && error && <p className="ma-estado ma-error">{error}</p>}

        {/* ---------- Servicios y productos ---------- */}
        {!cargando && !error && pestana === "servicios" && (
          <section aria-label="Servicios y productos">
            <div className="ma-barra">
              <p>
                {servicios.length} de {maximo} publicados
              </p>
              <button type="button" className="btn-primary" disabled={servicios.length >= maximo} onClick={abrirCrear}>
                + Agregar servicio o producto
              </button>
            </div>

            {servicios.length === 0 ? (
              <div className="ma-panel ma-vacio">
                <p>Aún no agregas nada. Crea tu primer servicio (por ejemplo «Piercing de oreja») o producto.</p>
                <button type="button" className="btn-primary" onClick={abrirCrear}>
                  + Agregar el primero
                </button>
              </div>
            ) : (
              <ul className="ma-grid">
                {servicios.map((s) => (
                  <li className={`ma-card ${s.activo ? "" : "inactivo"}`} key={s.id_servicio}>
                    <div
                      className={`ma-card-img ${s.imagen ? "" : "sin-foto"}`}
                      style={s.imagen ? { backgroundImage: `url(${getImagenUrl(s.imagen)})` } : undefined}
                    >
                      <span className={`ma-pill ${s.tipo}`}>{s.tipo === "servicio" ? "Servicio" : "Producto"}</span>
                      {!s.activo && <span className="ma-pill pausado">Pausado</span>}
                    </div>
                    <div className="ma-card-cuerpo">
                      <h3>{s.nombre}</h3>
                      <p className="ma-desc">{s.descripcion || "Sin descripción."}</p>
                    </div>
                    <div className="ma-card-datos">
                      <b>{plata(s.precio)}</b>
                      <span>{s.tipo === "servicio" && s.duracion_min ? textoDuracion(s.duracion_min) : "Entrega a coordinar"}</span>
                    </div>
                    <div className="ma-card-acciones">
                      <button type="button" onClick={() => abrirEditar(s)}>
                        <Icono icon={Pencil} size={16} /> Editar
                      </button>
                      <button type="button" className="peligro" onClick={() => handleEliminar(s)}>
                        <Icono icon={Trash2} size={16} /> Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ---------- Horarios ---------- */}
        {!cargando && !error && pestana === "horarios" && (
          <section className="ma-panel ma-horarios" aria-label="Horarios de atención">
            <h2>Cuándo atiendes</h2>
            <p className="ma-ayuda">
              Activa los días en que atiendes y define uno o más bloques. Al agendar, tus clientes verán las horas que
              caben dentro de estos bloques según lo que dure cada servicio.
            </p>

            {DIAS.map((d) => {
              const delDia = bloquesDe(d.n);
              return (
                <div className="ma-dia" key={d.n}>
                  <label className="ma-interruptor">
                    <input type="checkbox" checked={delDia.length > 0} onChange={() => alternarDia(d.n)} />
                    <span className="ma-pastilla" />
                    <span>{d.nombre}</span>
                  </label>

                  {delDia.length === 0 ? (
                    <span className="ma-cerrado">No atiendes</span>
                  ) : (
                    <div className="ma-bloques">
                      {delDia.map((b) => (
                        <div className="ma-bloque" key={b.i}>
                          <select
                            aria-label={`${d.nombre}: desde`}
                            value={b.hora_inicio}
                            onChange={(e) => cambiarBloque(b.i, "hora_inicio", e.target.value)}
                          >
                            {HORAS.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <small>a</small>
                          <select
                            aria-label={`${d.nombre}: hasta`}
                            value={b.hora_fin}
                            onChange={(e) => cambiarBloque(b.i, "hora_fin", e.target.value)}
                          >
                            {HORAS.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <button type="button" className="ma-quitar" onClick={() => quitarBloque(b.i)} aria-label="Quitar bloque">
                            ×
                          </button>
                        </div>
                      ))}
                      <button type="button" className="ma-mas" onClick={() => agregarBloque(d.n)}>
                        + Otro bloque
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="ma-acciones">
              <button
                type="button"
                className="btn-primary"
                disabled={!hayCambiosHorarios || guardandoHorarios}
                onClick={handleGuardarHorarios}
              >
                {guardandoHorarios ? "Guardando..." : "Guardar horarios"}
              </button>
              {hayCambiosHorarios && <span className="ma-pendiente">Tienes cambios sin guardar</span>}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {form && (
        <div className="ma-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="ma-modal" role="dialog" aria-modal="true" aria-label={editandoId ? "Editar" : "Agregar"}>
            <h2>{editandoId ? "Editar" : "Agregar a mi oferta"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="ma-campo">
                <span className="ma-label">¿Qué es?</span>
                <div className="ma-segmentos" role="radiogroup" aria-label="Tipo">
                  {[
                    { id: "servicio", label: "Servicio", ayuda: "Ocupa tu agenda (piercing, tatuaje...)" },
                    { id: "producto", label: "Producto", ayuda: "Se aparta y coordinas la entrega" },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      role="radio"
                      aria-checked={form.tipo === t.id}
                      className={form.tipo === t.id ? "activo" : ""}
                      onClick={() => setForm({ ...form, tipo: t.id })}
                    >
                      <b>{t.label}</b>
                      <small>{t.ayuda}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ma-campo">
                <label htmlFor="ma-nombre">Nombre</label>
                <input
                  id="ma-nombre"
                  value={form.nombre}
                  onChange={set("nombre")}
                  maxLength={80}
                  placeholder={form.tipo === "servicio" ? "Ej: Piercing de oreja" : "Ej: Taza de cerámica"}
                  required
                />
              </div>

              <div className="ma-campo">
                <label htmlFor="ma-desc">Descripción (opcional)</label>
                <textarea id="ma-desc" rows={3} maxLength={500} value={form.descripcion} onChange={set("descripcion")} />
              </div>

              <div className="ma-fila">
                <div className="ma-campo">
                  <label htmlFor="ma-precio">Precio en CLP (opcional)</label>
                  <input
                    id="ma-precio"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="500"
                    value={form.precio}
                    onChange={set("precio")}
                    placeholder="A convenir"
                  />
                </div>
                {form.tipo === "servicio" && (
                  <div className="ma-campo">
                    <label htmlFor="ma-duracion">Duración</label>
                    <select id="ma-duracion" value={form.duracion_min} onChange={set("duracion_min")}>
                      {DURACIONES.map((m) => (
                        <option key={m} value={m}>{textoDuracion(m)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="ma-campo">
                <span className="ma-label">Foto (opcional)</span>
                <div className="ma-archivo">
                  <label className="btn-ghost ma-subir">
                    Subir imagen
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirImagen} hidden />
                  </label>
                  <span>
                    {imagen
                      ? imagen.name
                      : quitarImagen
                        ? "Se quitará la foto actual"
                        : imagenActual
                          ? "Se mantiene la foto actual"
                          : "Ningún archivo seleccionado"}
                  </span>
                  {(imagen || (imagenActual && !quitarImagen)) && (
                    <button
                      type="button"
                      className="ma-quitar-img"
                      onClick={() => {
                        setImagen(null);
                        setQuitarImagen(Boolean(imagenActual));
                      }}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>

              <label className="ma-check">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                />
                Disponible para agendar (si lo pausas, se esconde sin borrarse)
              </label>

              <div className="ma-modal-acciones">
                <button type="button" className="btn-ghost" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
