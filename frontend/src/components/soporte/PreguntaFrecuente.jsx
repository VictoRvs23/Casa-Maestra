import React, { useEffect, useState, useCallback } from "react";
import { useAlerta } from "../../context/AlertaContext.jsx";
import {
  getPreguntas,
  createPregunta,
  updatePregunta,
  deletePregunta,
} from "../../services/preguntaFrecuente.services.js";
import { CATEGORIAS_SOPORTE } from "../../constants/categoriasSoporte.js";
import { ChevronDown, Pencil, Trash2 } from "@sketchicon/lucide";
import Icono from "../Icono.jsx";

const FORM_INICIAL = { pregunta: "", respuesta: "", categoria: CATEGORIAS_SOPORTE[0], orden: "" };

export default function PreguntasFrecuentes({ puedeGestionar = false }) {
  const { alerta, confirmar } = useAlerta();

  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [abierta, setAbierta] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const fetchPreguntas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreguntas({ categoria: categoriaFiltro });
      setPreguntas(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las preguntas frecuentes.");
    } finally {
      setLoading(false);
    }
  }, [categoriaFiltro]);

  useEffect(() => {
    fetchPreguntas();
  }, [fetchPreguntas]);

  const cambiarFiltro = (categoria) => {
    setAbierta(null);
    setCategoriaFiltro(categoria);
  };

  const abrirCrear = () => {
    setEditandoId(null);
    setForm({ ...FORM_INICIAL, categoria: categoriaFiltro || CATEGORIAS_SOPORTE[0] });
    setModalAbierto(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id_pregunta);
    setForm({
      pregunta: p.pregunta,
      respuesta: p.respuesta,
      categoria: p.categoria,
      orden: String(p.orden ?? 0),
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const payload = {
      pregunta: form.pregunta,
      respuesta: form.respuesta,
      categoria: form.categoria,
    };

    if (form.orden !== "") payload.orden = Number(form.orden);

    try {
      if (editandoId) {
        await updatePregunta(editandoId, payload);
      } else {
        await createPregunta(payload);
      }
      cerrarModal();
      fetchPreguntas();
      alerta(
        editandoId ? "La pregunta se actualizó correctamente." : "La pregunta se creó correctamente.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar la pregunta.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (p) => {
    const ok = await confirmar(`¿Eliminar la pregunta "${p.pregunta}"? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await deletePregunta(p.id_pregunta);
      fetchPreguntas();
      alerta("La pregunta se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo eliminar la pregunta.", { tipo: "error" });
    }
  };

  return (
    <>
      <div className="soporte-bloque">

        <div className="soporte-chips" role="group" aria-label="Filtrar por categoría">
          <button
            className={`soporte-chip ${categoriaFiltro === "" ? "activo" : ""}`}
            onClick={() => cambiarFiltro("")}
          >
            Todas
          </button>
          {CATEGORIAS_SOPORTE.map((c) => (
            <button
              key={c}
              className={`soporte-chip ${categoriaFiltro === c ? "activo" : ""}`}
              onClick={() => cambiarFiltro(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {puedeGestionar && (
          <div className="soporte-toolbar">
            <button className="soporte-create-btn" onClick={abrirCrear}>
              + Crear pregunta
            </button>
          </div>
        )}

        {loading && <p className="estado-msg">Cargando preguntas...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && preguntas.length === 0 && (
          <p className="estado-msg">
            {categoriaFiltro
              ? "No hay preguntas en esta categoría."
              : puedeGestionar
                ? "Todavía no hay preguntas frecuentes. Crea la primera con el botón de arriba."
                : "Pronto encontrarás aquí las respuestas a las dudas más comunes."}
          </p>
        )}

        {!loading && !error && preguntas.length > 0 && (
          <div className="soporte-lista">
            {preguntas.map((p) => {
              const estaAbierta = abierta === p.id_pregunta;
              return (
                <div className={`soporte-item ${estaAbierta ? "abierta" : ""}`} key={p.id_pregunta}>
                  <button
                    className="soporte-pregunta"
                    aria-expanded={estaAbierta}
                    onClick={() => setAbierta(estaAbierta ? null : p.id_pregunta)}
                  >
                    <span className="soporte-pregunta-texto">
                      {p.pregunta}
                      <small className="soporte-categoria">{p.categoria}</small>
                    </span>
                    <span className="soporte-chevron">
                      <Icono icon={ChevronDown} size={20} />
                    </span>
                  </button>

                  {estaAbierta && (
                    <div className="soporte-respuesta">
                      <p>{p.respuesta}</p>

                      {puedeGestionar && (
                        <div className="soporte-admin-actions">
                          <button onClick={() => abrirEditar(p)}>
                            <Icono icon={Pencil} size={16} /> Editar
                          </button>
                          <button className="danger" onClick={() => handleEliminar(p)}>
                            <Icono icon={Trash2} size={16} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal-box">
            <h2>{editandoId ? "Editar pregunta" : "Crear pregunta"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Pregunta</label>
                <input
                  name="pregunta"
                  value={form.pregunta}
                  onChange={handleFormChange}
                  maxLength={200}
                  minLength={5}
                  placeholder="Ej: ¿Cómo reservo un estudio?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Respuesta</label>
                <textarea
                  name="respuesta"
                  value={form.respuesta}
                  onChange={handleFormChange}
                  maxLength={2000}
                  minLength={5}
                  rows={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleFormChange} required>
                  {CATEGORIAS_SOPORTE.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Orden (opcional)</label>
                <input
                  type="number"
                  name="orden"
                  value={form.orden}
                  onChange={handleFormChange}
                  min={0}
                  step={1}
                  placeholder="0 aparece primero"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}