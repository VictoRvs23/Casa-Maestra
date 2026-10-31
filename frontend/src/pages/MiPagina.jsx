import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import PaginaLienzo from "../components/pagina/PaginaLienzo.jsx";
import BloqueEditor from "../components/pagina/BloqueEditor.jsx";
import {
  IconoTexto,
  IconoImagen,
  IconoGaleria,
  IconoSeparador,
  IconoWeb,
  IconoCamara,
  IconoCerrar,
  IconoMas,
  IconoSubir,
} from "../components/pagina/iconos.js";
import { Pencil } from "@sketchicon/lucide";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getMiPagina, updateMiPagina, subirImagenPagina } from "../services/pagina.services.js";
import { getAvatarUrl } from "../services/usuario.services.js";
import {
  FUENTES,
  COLORES_ACENTO,
  COLORES_FONDO,
  MAX_BLOQUES,
  TIPOS_BLOQUE,
  ESTADISTICAS_EJEMPLO,
  crearBloque,
  normalizarBloque,
  CLAVES_REDES,
} from "../constants/paginaEstilos.js";
import "../styles/pagina/MiPagina.css";

const ICONOS_BLOQUE = {
  texto: IconoTexto,
  imagen: IconoImagen,
  galeria: IconoGaleria,
  separador: IconoSeparador,
  redes: IconoWeb,
};

const AYUDA_BLOQUE = {
  texto: "Un párrafo para presentarte",
  imagen: "Una foto grande",
  galeria: "Hasta 6 fotos pequeñas",
  separador: "Una línea con una hoja",
  redes: "Instagram, TikTok, WhatsApp y más",
};

const PESTANAS = [
  { id: "bloques", label: "Bloques" },
  { id: "estilo", label: "Estilo" },
  { id: "resumen", label: "Resumen" },
];

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const aFormulario = (pagina) => ({
  publicada: pagina.publicada,
  color_acento: pagina.color_acento,
  color_fondo: pagina.color_fondo,
  fuente: pagina.fuente,
  portada: pagina.portada,
  bloques: pagina.bloques.map(normalizarBloque),
});

const bloqueTieneContenido = (b) => {
  switch (b.tipo) {
    case "texto": return b.contenido.trim() !== "";
    case "imagen": return Boolean(b.url);
    case "galeria": return b.imagenes.some(Boolean);
    case "redes": return CLAVES_REDES.some((c) => b[c]);
    default: return false;
  }
};

export default function MiPagina() {
  const { alerta, confirmar } = useAlerta();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null); 
  const [form, setForm] = useState(null); 
  const [guardado, setGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoClave, setSubiendoClave] = useState(null);

  const [pestana, setPestana] = useState("bloques");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [nuevoId, setNuevoId] = useState(null); 
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [sobreId, setSobreId] = useState(null);

  useEffect(() => {
    let cancelado = false;

    getMiPagina()
      .then(({ pagina, residente, usuario }) => {
        if (cancelado) return;
        const inicial = aFormulario(pagina);
        setInfo({ residente, usuario });
        setForm(inicial);
        setGuardado(inicial);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error(err);
        setError(err.response?.data?.message || "No se pudo cargar tu página.");
      })
      .finally(() => !cancelado && setCargando(false));

    return () => {
      cancelado = true;
    };
  }, []);

  const hayCambios = form && JSON.stringify(form) !== JSON.stringify(guardado);
  
  useEffect(() => {
    if (!hayCambios) return;
    const avisar = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayCambios]);

  useEffect(() => {
    if (!nuevoId) return;
    const el = document.getElementById(`bloque-${nuevoId}`);
    if (el) {
      const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "center" });
    }
    setNuevoId(null);
  }, [nuevoId]);

  const cambiar = (campos) => setForm((f) => ({ ...f, ...campos }));

  const cambiarBloque = (id, cambios) =>
    setForm((f) => ({
      ...f,
      bloques: f.bloques.map((b) =>
        b.id === id ? { ...b, ...(typeof cambios === "function" ? cambios(b) : cambios) } : b
      ),
    }));

  const agregarBloque = (tipo) => {
    if (form.bloques.length >= MAX_BLOQUES) {
      alerta(`Puedes agregar hasta ${MAX_BLOQUES} bloques.`, { tipo: "advertencia" });
      return;
    }
    const bloque = crearBloque(tipo);
    setForm((f) => ({ ...f, bloques: [...f.bloques, bloque] }));
    setNuevoId(bloque.id);
    setPanelAbierto(false);
  };

  const moverBloque = (id, direccion) =>
    setForm((f) => {
      const bloques = [...f.bloques];
      const i = bloques.findIndex((b) => b.id === id);
      const j = i + direccion;
      if (i < 0 || j < 0 || j >= bloques.length) return f;
      [bloques[i], bloques[j]] = [bloques[j], bloques[i]];
      return { ...f, bloques };
    });

  const reordenarBloque = (desdeId, haciaId) =>
    setForm((f) => {
      const bloques = [...f.bloques];
      const i = bloques.findIndex((b) => b.id === desdeId);
      const j = bloques.findIndex((b) => b.id === haciaId);
      if (i < 0 || j < 0 || i === j) return f;
      const [movido] = bloques.splice(i, 1);
      bloques.splice(j, 0, movido);
      return { ...f, bloques };
    });

  const terminarArrastre = () => {
    setArrastrandoId(null);
    setSobreId(null);
  };

  const eliminarBloque = async (bloque) => {
    if (bloqueTieneContenido(bloque)) {
      const ok = await confirmar("¿Eliminar este bloque? Perderás lo que escribiste o subiste en él.", {
        textoConfirmar: "Eliminar",
      });
      if (!ok) return;
    }
    setForm((f) => ({ ...f, bloques: f.bloques.filter((b) => b.id !== bloque.id) }));
  };

  const subirImagen = async (archivo, clave) => {
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      alerta("Solo se permiten imágenes JPG, PNG o WEBP.", { tipo: "advertencia" });
      return null;
    }
    if (archivo.size > MAX_BYTES) {
      alerta("La imagen pesa más de 5 MB. Elige una más liviana.", { tipo: "advertencia" });
      return null;
    }

    setSubiendoClave(clave);
    try {
      const { url } = await subirImagenPagina(archivo);
      return url;
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo subir la imagen.", { tipo: "error" });
      return null;
    } finally {
      setSubiendoClave(null);
    }
  };

  const handlePortada = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = "";
    if (!archivo) return;
    const url = await subirImagen(archivo, "portada");
    if (url) cambiar({ portada: url });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const { pagina } = await updateMiPagina(form);
      const nuevo = aFormulario(pagina);
      setForm(nuevo);
      setGuardado(nuevo);
      alerta(
        nuevo.publicada ? "Tu página se guardó y está publicada." : "Tu página se guardó como borrador.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar tu página.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const teclaPestanas = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = PESTANAS.findIndex((p) => p.id === pestana);
    const paso = e.key === "ArrowRight" ? 1 : -1;
    const siguiente = PESTANAS[(i + paso + PESTANAS.length) % PESTANAS.length];
    setPestana(siguiente.id);
    document.getElementById(`mp-tab-${siguiente.id}`)?.focus();
  };

  if (cargando) {
    return (
      <div className="mipagina-page">
        <Navbar />
        <p className="estado-msg">Cargando tu página...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mipagina-page">
        <Navbar />
        <p className="estado-msg estado-error">{error || "No se pudo cargar tu página."}</p>
        <Footer />
      </div>
    );
  }

  const { residente, usuario } = info;
  const iniciales = residente.nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mipagina-page">
      <Navbar />

      <div className="mipagina-barra">
        <div className="mipagina-barra-titulo">
          <h1>Mi página</h1>
          <span className={`mipagina-estado ${hayCambios ? "pendiente" : ""}`} role="status">
            {hayCambios ? "Cambios sin guardar" : "Todo guardado"}
          </span>
        </div>

        <div className="mipagina-prev-acciones">
          {guardado.publicada && (
            <Link to={`/residentes/${residente.slug}`} className="mipagina-ver-link">
              Ver mi página
            </Link>
          )}

          <div className="mipagina-publicar">
            <span>{form.publicada ? "Publicada" : "Borrador"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.publicada}
              aria-label="Publicar mi página"
              className={`mipagina-switch ${form.publicada ? "activo" : ""}`}
              onClick={() => cambiar({ publicada: !form.publicada })}
            >
              <span />
            </button>
          </div>

          <button type="button" className="btn-primary" disabled={!hayCambios || guardando} onClick={handleGuardar}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="mipagina-editor">
        <aside className={`mipagina-lateral ${panelAbierto ? "abierto" : ""}`} aria-label="Herramientas de la página">
          <button
            type="button"
            className="mipagina-lateral-toggle"
            aria-expanded={panelAbierto}
            aria-controls="mp-lateral-contenido"
            onClick={() => setPanelAbierto((v) => !v)}
          >
            Herramientas
            <Icono icon={IconoSubir} size={18} />
          </button>

          <div className="mipagina-lateral-contenido" id="mp-lateral-contenido">
            <div className="lateral-tabs" role="tablist" aria-label="Secciones de herramientas" onKeyDown={teclaPestanas}>
              {PESTANAS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  role="tab"
                  id={`mp-tab-${p.id}`}
                  aria-selected={pestana === p.id}
                  aria-controls={`mp-panel-${p.id}`}
                  tabIndex={pestana === p.id ? 0 : -1}
                  className="lateral-tab"
                  onClick={() => setPestana(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Bloques */}
            {pestana === "bloques" && (
              <div role="tabpanel" id="mp-panel-bloques" aria-labelledby="mp-tab-bloques">
                <p className="lateral-ayuda">
                  Toca un bloque para agregarlo al final de tu página. Luego puedes arrastrarlo para cambiarlo de lugar.
                </p>
                <div className="lateral-bloques">
                  {TIPOS_BLOQUE.map(({ tipo, label }) => (
                    <button type="button" key={tipo} className="lateral-bloque-btn" onClick={() => agregarBloque(tipo)}>
                      <Icono icon={ICONOS_BLOQUE[tipo]} size={22} />
                      <span className="lateral-bloque-texto">
                        <strong>{label}</strong>
                        <small>{AYUDA_BLOQUE[tipo]}</small>
                      </span>
                      <Icono icon={IconoMas} size={18} />
                    </button>
                  ))}
                </div>
                <p className="lateral-contador">
                  {form.bloques.length} de {MAX_BLOQUES} bloques
                </p>
              </div>
            )}

            {/* Estilo */}
            {pestana === "estilo" && (
              <div role="tabpanel" id="mp-panel-estilo" aria-labelledby="mp-tab-estilo">
                <h2 className="lateral-subtitulo">Color de detalles</h2>
                <div className="mipagina-swatches">
                  {COLORES_ACENTO.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      className={`swatch ${form.color_acento === c.hex ? "activo" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.nombre}
                      aria-pressed={form.color_acento === c.hex}
                      onClick={() => cambiar({ color_acento: c.hex })}
                    />
                  ))}
                  <label className="swatch-otro">
                    <Icono icon={Pencil} size={14} /> Otro
                    <input
                      type="color"
                      aria-label="Elegir otro color de detalles"
                      value={form.color_acento}
                      onChange={(e) => cambiar({ color_acento: e.target.value })}
                    />
                  </label>
                </div>

                <h2 className="lateral-subtitulo">Fondo de página</h2>
                <div className="mipagina-swatches">
                  {COLORES_FONDO.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      className={`swatch ${form.color_fondo === c.hex ? "activo" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.nombre}
                      aria-pressed={form.color_fondo === c.hex}
                      onClick={() => cambiar({ color_fondo: c.hex })}
                    />
                  ))}
                  <label className="swatch-otro">
                    <Icono icon={Pencil} size={14} /> Otro
                    <input
                      type="color"
                      aria-label="Elegir otro color de fondo"
                      value={form.color_fondo}
                      onChange={(e) => cambiar({ color_fondo: e.target.value })}
                    />
                  </label>
                </div>

                <h2 className="lateral-subtitulo">Fuente</h2>
                <div className="mipagina-fuentes">
                  {Object.entries(FUENTES).map(([clave, f]) => (
                    <button
                      type="button"
                      key={clave}
                      className={`fuente-chip ${form.fuente === clave ? "activo" : ""}`}
                      style={{ fontFamily: f.family }}
                      aria-pressed={form.fuente === clave}
                      onClick={() => cambiar({ fuente: clave })}
                    >
                      <span>{f.label}</span>
                      <span className="fuente-muestra">Aa</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            {pestana === "resumen" && (
              <div role="tabpanel" id="mp-panel-resumen" aria-labelledby="mp-tab-resumen">
                <div className="mipagina-stats-grid">
                  {ESTADISTICAS_EJEMPLO.map((e, i) => (
                    <article
                      className="estadistica-card"
                      key={e.etiqueta}
                      style={{ "--giro": ["-1deg", "0.8deg", "-0.6deg"][i] }}
                    >
                      <p className="estadistica-etiqueta">{e.etiqueta}</p>
                      <p className="estadistica-valor">{e.valor}</p>
                    </article>
                  ))}
                </div>
                <p className="mipagina-nota">Valores de ejemplo: se conectarán a datos reales más adelante.</p>
              </div>
            )}
          </div>
        </aside>

        <main className="mipagina-lienzo-wrap">
          <PaginaLienzo
            editor
            estilo={form}
            nombre={residente.nombre}
            descripcion={residente.descripcion}
            avatarUrl={usuario?.avatar ? getAvatarUrl(usuario.avatar) : null}
            iniciales={iniciales}
            accionPortada={
              <div className="pagina-portada-acciones">
                <label className="pagina-portada-btn">
                  <Icono icon={IconoCamara} size={15} />
                  {subiendoClave === "portada" ? "Subiendo..." : "Cambiar portada"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={subiendoClave === "portada"}
                    onChange={handlePortada}
                  />
                </label>
                {form.portada && (
                  <button type="button" className="pagina-portada-btn" onClick={() => cambiar({ portada: null })}>
                    <Icono icon={IconoCerrar} size={15} /> Quitar
                  </button>
                )}
              </div>
            }
            accionAvatar={
              <Link
                to="/perfil?tab=datos-personales"
                className="pagina-avatar-edit"
                aria-label="Cambiar foto de perfil"
                title="La foto se cambia desde tu perfil"
              >
                <Icono icon={Pencil} size={14} />
              </Link>
            }
          >
            {form.bloques.length === 0 && (
              <p className="mipagina-vacio">
                Todavía no hay bloques. Agrega el primero desde el panel de herramientas.
              </p>
            )}

            {form.bloques.map((bloque, i) => (
              <BloqueEditor
                key={bloque.id}
                bloque={bloque}
                esPrimero={i === 0}
                esUltimo={i === form.bloques.length - 1}
                subiendoClave={subiendoClave}
                arrastrando={arrastrandoId === bloque.id}
                sobre={sobreId === bloque.id}
                onCambiar={(cambios) => cambiarBloque(bloque.id, cambios)}
                onSubirImagen={subirImagen}
                onMover={(direccion) => moverBloque(bloque.id, direccion)}
                onEliminar={() => eliminarBloque(bloque)}
                onArrastrar={() => setArrastrandoId(bloque.id)}
                onArrastrarSobre={(e) => {
                  if (!arrastrandoId || arrastrandoId === bloque.id) return;
                  e.preventDefault(); 
                  e.dataTransfer.dropEffect = "move";
                  setSobreId(bloque.id);
                }}
                onSoltar={(e) => {
                  e.preventDefault();
                  if (arrastrandoId) reordenarBloque(arrastrandoId, bloque.id);
                  terminarArrastre();
                }}
                onTerminarArrastre={terminarArrastre}
              />
            ))}
          </PaginaLienzo>
        </main>
      </div>

      <Footer />
    </div>
  );
}