import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import PaginaLienzo from "../components/pagina/PaginaLienzo.jsx";
import BloqueEditor from "../components/pagina/BloqueEditor.jsx";
import BloqueVista from "../components/pagina/BloqueVista.jsx";
import {
  IconoTexto,
  IconoImagen,
  IconoGaleria,
  IconoSeparador,
  IconoWeb,
  IconoVideo,
  IconoCamara,
  IconoCerrar,
  IconoMas,
  IconoSubir,
} from "../components/pagina/Iconos.js";
import { Pencil } from "@sketchicon/lucide";
import AvatarCropper from "../components/perfil/AvatarCropper.jsx";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getMiPagina, updateMiPagina, subirImagenPagina, getImagenUrl } from "../services/pagina.services.js";
import { getMisServicios, getMisHorarios, getCitasResidente } from "../services/agendaResidente.services.js";
import {
  FUENTES,
  COLORES_ACENTO,
  COLORES_FONDO,
  PALETAS,
  MAX_BLOQUES,
  TIPOS_BLOQUE,
  crearBloque,
  normalizarBloque,
} from "../constants/paginaEstilos.js";
import "../styles/pagina/MiPagina.css";

const ICONOS_BLOQUE = {
  texto: IconoTexto,
  imagen: IconoImagen,
  galeria: IconoGaleria,
  separador: IconoSeparador,
  redes: IconoWeb,
  video: IconoVideo,
};

const AYUDA_BLOQUE = {
  texto: "Un párrafo para presentarte",
  imagen: "Una foto grande",
  galeria: "Hasta 6 fotos pequeñas",
  separador: "Una línea con una hoja",
  redes: "Instagram, TikTok, WhatsApp y más",
  video: "YouTube, Vimeo, Instagram o TikTok",
};

const PESTANAS = [
  { id: "tarjeta", label: "Tarjeta" },
  { id: "bloques", label: "Bloques" },
  { id: "estilo", label: "Estilo" },
  { id: "resumen", label: "Resumen" },
];

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const recorteDe = (clave) => {
  if (clave === "portada") return { aspect: 4, anchoSalida: 1600, titulo: "Ajusta tu portada", circular: false };
  if (clave === "foto") return { aspect: 1, anchoSalida: 600, titulo: "Ajusta tu foto", circular: true };
  if (clave.endsWith(":imagen")) return { aspect: 16 / 9, anchoSalida: 1280, titulo: "Ajusta tu imagen", circular: false };
  return { aspect: 1, anchoSalida: 800, titulo: "Ajusta tu foto", circular: false };
};

const slugDe = (texto = "") =>
  String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "residente";

const aFormulario = (pagina, residente) => ({
  nombre: residente.nombre,
  descripcion: residente.descripcion || "",
  publicada: pagina.publicada,
  color_acento: pagina.color_acento,
  color_fondo: pagina.color_fondo,
  fuente: pagina.fuente,
  portada: pagina.portada,
  foto: pagina.foto,
  bloques: pagina.bloques.map(normalizarBloque),
});

const claveBorrador = (slug) => `mipagina-borrador-${slug}`;

const leerBorrador = (slug) => {
  try {
    return JSON.parse(localStorage.getItem(claveBorrador(slug)));
  } catch {
    return null;
  }
};

const guardarBorrador = (slug, form) => {
  try {
    localStorage.setItem(claveBorrador(slug), JSON.stringify({ form, fecha: Date.now() }));
  } catch {
  }
};

const borrarBorrador = (slug) => {
  try {
    localStorage.removeItem(claveBorrador(slug));
  } catch {
  }
};

function InsertarBloque({ abierto, onAlternar, onElegir }) {
  return (
    <div className={`insertar-bloque ${abierto ? "abierto" : ""}`}>
      <button type="button" aria-label="Insertar un bloque aquí" aria-expanded={abierto} onClick={onAlternar}>
        <Icono icon={IconoMas} size={16} />
      </button>
      {abierto && (
        <div className="insertar-opciones" role="group" aria-label="Tipo de bloque">
          {TIPOS_BLOQUE.map(({ tipo, label }) => (
            <button type="button" key={tipo} onClick={() => onElegir(tipo)}>
              <Icono icon={ICONOS_BLOQUE[tipo]} size={16} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MiPagina() {
  const { alerta, confirmar } = useAlerta();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [form, setForm] = useState(null);
  const [guardado, setGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoClave, setSubiendoClave] = useState(null);
  const [recorte, setRecorte] = useState(null);
  const [agenda, setAgenda] = useState(null);
  const [vista, setVista] = useState("editar");
  const [dispositivo, setDispositivo] = useState("escritorio");
  const [menuCompartir, setMenuCompartir] = useState(false);
  const [insertarEn, setInsertarEn] = useState(null);
  const [checklistAbierto, setChecklistAbierto] = useState(true);
  const menuRef = useRef(null);
  const [eliminado, setEliminado] = useState(null);
  const temporizadorDeshacer = useRef(null);

  const [pestana, setPestana] = useState("tarjeta");
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [nuevoId, setNuevoId] = useState(null);
  const [arrastrandoId, setArrastrandoId] = useState(null);
  const [sobreId, setSobreId] = useState(null);

  useEffect(() => {
    let cancelado = false;

    getMiPagina()
      .then(({ pagina, residente, estadisticas }) => {
        if (cancelado) return;
        const inicial = aFormulario(pagina, residente);
        setInfo({ residente });
        setEstadisticas(estadisticas);
        setForm(inicial);
        setGuardado(inicial);

        const borrador = leerBorrador(residente.slug);
        if (borrador?.form && JSON.stringify(borrador.form) !== JSON.stringify(inicial)) {
          const cuando = new Date(borrador.fecha).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
          confirmar(`Encontramos cambios sin guardar de tu última sesión (${cuando}). ¿Quieres recuperarlos?`, {
            textoConfirmar: "Recuperar",
          }).then((ok) => {
            if (cancelado) return;
            if (ok) setForm({ ...inicial, ...borrador.form, bloques: (borrador.form.bloques || []).map(normalizarBloque) });
            else borrarBorrador(residente.slug);
          });
        } else {
          borrarBorrador(residente.slug);
        }
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

  useEffect(() => {
    let cancelado = false;
    Promise.all([getMisServicios(), getMisHorarios(), getCitasResidente()])
      .then(([s, h, c]) => {
        if (cancelado) return;
        setAgenda({
          servicios: s.servicios.filter((x) => x.activo).length,
          horarios: h.bloques.length,
          pendientes: c.citas.filter((x) => x.estado === "pendiente" && !x.pasada).length,
        });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!menuCompartir) return;
    const fuera = (e) => !menuRef.current?.contains(e.target) && setMenuCompartir(false);
    const tecla = (e) => e.key === "Escape" && setMenuCompartir(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [menuCompartir]);

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

  const slug = info?.residente?.slug;
  useEffect(() => {
    if (!slug || !form || !hayCambios) return;
    const t = setTimeout(() => guardarBorrador(slug, form), 600);
    return () => clearTimeout(t);
  }, [slug, form, hayCambios]);

  useEffect(() => () => clearTimeout(temporizadorDeshacer.current), []);

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

  const agregarBloque = (tipo, indice = null) => {
    if (form.bloques.length >= MAX_BLOQUES) {
      alerta(`Puedes agregar hasta ${MAX_BLOQUES} bloques.`, { tipo: "advertencia" });
      return;
    }
    const bloque = crearBloque(tipo);
    setForm((f) => {
      const bloques = [...f.bloques];
      if (indice === null) bloques.push(bloque);
      else bloques.splice(indice, 0, bloque);
      return { ...f, bloques };
    });
    setNuevoId(bloque.id);
    setPanelAbierto(false);
    setInsertarEn(null);
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

  const eliminarBloque = (bloque) => {
    const indice = form.bloques.findIndex((b) => b.id === bloque.id);
    if (indice < 0) return;

    setForm((f) => ({ ...f, bloques: f.bloques.filter((b) => b.id !== bloque.id) }));
    setEliminado({ bloque, indice });

    clearTimeout(temporizadorDeshacer.current);
    temporizadorDeshacer.current = setTimeout(() => setEliminado(null), 8000);
  };

  const deshacerEliminar = () => {
    if (!eliminado) return;
    const { bloque, indice } = eliminado;
    clearTimeout(temporizadorDeshacer.current);
    setForm((f) => {
      const bloques = [...f.bloques];
      bloques.splice(Math.min(indice, bloques.length), 0, bloque);
      return { ...f, bloques };
    });
    setEliminado(null);
    setNuevoId(bloque.id);
  };

  const pedirRecorte = (archivo, clave) =>
    new Promise((resolver) => {
      setRecorte({
        src: URL.createObjectURL(archivo),
        config: recorteDe(clave),
        nombre: archivo.name.replace(/\.[^.]+$/, "") || "imagen",
        resolver,
      });
    });

  const cerrarRecorte = (resultado) => {
    if (!recorte) return;
    URL.revokeObjectURL(recorte.src);
    recorte.resolver(resultado);
    setRecorte(null);
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

    const recortada = await pedirRecorte(archivo, clave);
    if (!recortada) return null;

    setSubiendoClave(clave);
    try {
      const { url } = await subirImagenPagina(recortada);
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

  const handleFoto = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = "";
    if (!archivo) return;
    const url = await subirImagen(archivo, "foto");
    if (url) cambiar({ foto: url });
  };

  const handleGuardar = async () => {
    if (form.publicada && !form.descripcion.trim()) {
      setPestana("tarjeta");
      alerta("Para publicar, escribe una descripción corta de tu trabajo. Aparece en tu tarjeta de Residentes.", {
        tipo: "error",
      });
      return;
    }

    const slugNuevo = slugDe(form.nombre);
    if (slugNuevo !== info.residente.slug) {
      const ok = await confirmar(
        `Tu enlace cambiará de /residentes/${info.residente.slug} a /residentes/${slugNuevo}. Los enlaces anteriores seguirán funcionando. ¿Guardar los cambios?`,
        { textoConfirmar: "Guardar" }
      );
      if (!ok) return;
    }

    setGuardando(true);
    try {
      const { pagina, residente: residenteGuardado } = await updateMiPagina(form);
      const nuevo = aFormulario(pagina, residenteGuardado);
      setForm(nuevo);
      setGuardado(nuevo);
      borrarBorrador(info.residente.slug);
      setInfo({ residente: residenteGuardado });
      alerta(
        nuevo.publicada
          ? "Tu página se guardó y está publicada. Ya puedes copiar el enlace para compartirla."
          : "Tu página se guardó como borrador. Solo tú puedes verla.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar tu página.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const copiarEnlace = async () => {
    const enlace = `${window.location.origin}/residentes/${info.residente.slug}`;
    try {
      await navigator.clipboard.writeText(enlace);
      alerta("Enlace copiado. Ya puedes compartirlo.", { tipo: "exito" });
    } catch {
      window.prompt("Copia el enlace de tu página:", enlace);
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

  const { residente } = info;
  const iniciales = (form.nombre || residente.nombre)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const agendaLista = Boolean(agenda && agenda.servicios > 0 && agenda.horarios > 0);
  const abrirArchivo = (selector) => () => document.querySelector(selector)?.click();

  const pasos = [
    { id: "nombre", label: "Nombre artístico", ok: Boolean(form.nombre.trim()), onClick: () => setPestana("tarjeta") },
    { id: "descripcion", label: "Descripción corta", ok: Boolean(form.descripcion.trim()), onClick: () => setPestana("tarjeta") },
    { id: "foto", label: "Foto de tu página", ok: Boolean(form.foto), onClick: abrirArchivo(".pagina-avatar-edit input") },
    { id: "portada", label: "Portada", ok: Boolean(form.portada), onClick: abrirArchivo(".pagina-portada-btn input") },
    { id: "bloques", label: "Al menos un bloque", ok: form.bloques.length > 0, onClick: () => setPestana("bloques") },
    { id: "agenda", label: "Servicios y horarios", ok: agendaLista, ayuda: "en Mi agenda", enlace: "/mi-agenda" },
  ];
  const completados = pasos.filter((p) => p.ok).length;

  const enPrevia = vista === "previa";

  return (
    <div className="mipagina-page">
      <Navbar />

      {/* Estado y Acciones Principales */}
      <div className="mipagina-barra">
        <div className="mipagina-barra-titulo">
          <div className="mipagina-barra-linea">
            <h1>Mi página</h1>
            <span className={`mipagina-estado ${hayCambios ? "pendiente" : ""}`} role="status">
              {hayCambios ? "Cambios sin guardar" : "Todo guardado"}
            </span>
          </div>

          <p className="mipagina-aviso-publicacion" role="note">
            {form.publicada && guardado.publicada && "Tu página está publicada: cualquier persona con el enlace puede verla."}
            {form.publicada && !guardado.publicada && "Activaste «Publicada», pero falta guardar para que el público la vea."}
            {!form.publicada && !guardado.publicada && "Tu página está en borrador: solo tú puedes verla. Activa «Publicada» y guarda para mostrarla."}
            {!form.publicada && guardado.publicada && "Al guardar, tu página dejará de verse para el público."}
            {!residente.activa && " El equipo ocultó tu tarjeta temporalmente: no aparece en Residentes."}
          </p>
        </div>

        <div className="mipagina-prev-acciones">
          {guardado.publicada && (
            <div className="mipagina-compartir" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuCompartir}
                onClick={() => setMenuCompartir((v) => !v)}
              >
                Compartir ▾
              </button>
              {menuCompartir && (
                <div className="mipagina-menu" role="menu">
                  <Link to={`/residentes/${residente.slug}`} role="menuitem" onClick={() => setMenuCompartir(false)}>
                    Ver mi página
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuCompartir(false);
                      copiarEnlace();
                    }}
                  >
                    Copiar enlace
                  </button>
                </div>
              )}
            </div>
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
            {guardando ? "Guardando..." : hayCambios ? "Guardar cambios" : "Guardado ✓"}
          </button>
        </div>
      </div>

      <div className="mipagina-editor">
        {/* SideBar Herramientas */}
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
            {completados < pasos.length && (
              <section className="mp-checklist" aria-label="Pasos para completar tu página">
                <button
                  type="button"
                  className="mp-checklist-cab"
                  aria-expanded={checklistAbierto}
                  onClick={() => setChecklistAbierto((v) => !v)}
                >
                  <span>
                    Tu página: {completados} de {pasos.length}
                  </span>
                  <span aria-hidden="true">{checklistAbierto ? "–" : "+"}</span>
                </button>
                <div className="mp-progreso" role="progressbar" aria-valuemin={0} aria-valuemax={pasos.length} aria-valuenow={completados}>
                  <span style={{ width: `${(completados / pasos.length) * 100}%` }} />
                </div>
                {checklistAbierto && (
                  <ul>
                    {pasos.map((p) => (
                      <li key={p.id}>
                        {p.enlace ? (
                          <Link to={p.enlace} className={`mp-paso ${p.ok ? "listo" : ""}`}>
                            <span className="mp-marca" aria-hidden="true">✓</span>
                            {p.label}
                            {!p.ok && <small>{p.ayuda}</small>}
                          </Link>
                        ) : (
                          <button type="button" className={`mp-paso ${p.ok ? "listo" : ""}`} onClick={p.onClick}>
                            <span className="mp-marca" aria-hidden="true">✓</span>
                            {p.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

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

            {/* Tarjeta */}
            {pestana === "tarjeta" && (
              <div role="tabpanel" id="mp-panel-tarjeta" aria-labelledby="mp-tab-tarjeta">
                <p className="lateral-ayuda">
                  Así te verá la gente en Residentes. Tu página se publica junto con tu tarjeta, así que ambas deben
                  estar completas.
                </p>

                <div className="tarjeta-campo">
                  <label htmlFor="tarjeta-nombre">Nombre artístico</label>
                  <input
                    id="tarjeta-nombre"
                    type="text"
                    value={form.nombre}
                    maxLength={80}
                    onChange={(e) => cambiar({ nombre: e.target.value })}
                  />
                  <small>
                    Tu enlace será <strong>/residentes/{slugDe(form.nombre)}</strong>.
                    {slugDe(form.nombre) !== residente.slug && " Si lo cambias, los enlaces anteriores seguirán funcionando."}
                  </small>
                </div>

                <div className="tarjeta-campo">
                  <label htmlFor="tarjeta-descripcion">Descripción corta</label>
                  <input
                    id="tarjeta-descripcion"
                    type="text"
                    value={form.descripcion}
                    maxLength={150}
                    placeholder="Ej: Piercings y Tatuajes"
                    onChange={(e) => cambiar({ descripcion: e.target.value })}
                  />
                  <small>
                    {form.descripcion.length}/150 · Obligatoria para publicar. La foto de tu página (el círculo junto a tu
                    nombre) se usa como imagen de tu tarjeta en Residentes.
                  </small>
                </div>

                <p className="tarjeta-requisitos" role="note">
                  Para publicar necesitas: nombre artístico {form.nombre.trim() ? "✓" : "✗"} · descripción{" "}
                  {form.descripcion.trim() ? "✓" : "✗"}
                </p>
              </div>
            )}

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
                <h2 className="lateral-subtitulo">Paletas listas</h2>
                <div className="mipagina-paletas">
                  {PALETAS.map((pal) => {
                    const activa = form.color_acento === pal.acento && form.color_fondo === pal.fondo;
                    return (
                      <button
                        type="button"
                        key={pal.nombre}
                        className={`paleta ${activa ? "activa" : ""}`}
                        aria-pressed={activa}
                        onClick={() => cambiar({ color_acento: pal.acento, color_fondo: pal.fondo })}
                      >
                        <span
                          className="paleta-muestra"
                          style={{ background: `linear-gradient(135deg, ${pal.fondo} 50%, ${pal.acento} 50%)` }}
                        />
                        <span>{pal.nombre}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mipagina-nota">También puedes personalizar cada color aquí abajo.</p>

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
                  {[
                    { etiqueta: "Visitas del mes", valor: estadisticas?.visitas_mes },
                    { etiqueta: "Agendas generadas", valor: estadisticas?.agendas },
                    { etiqueta: "Seguidores", valor: estadisticas?.seguidores },
                  ].map((e, i) => (
                    <article
                      className="estadistica-card"
                      key={e.etiqueta}
                      style={{ "--giro": ["-1deg", "0.8deg", "-0.6deg"][i] }}
                    >
                      <p className="estadistica-etiqueta">{e.etiqueta}</p>
                      <p className="estadistica-valor">{e.valor ?? "—"}</p>
                    </article>
                  ))}
                </div>
                <Link
                  to={agenda?.pendientes > 0 ? "/mi-agenda?tab=citas" : "/mi-agenda"}
                  className={`mipagina-agenda-link ${agenda?.pendientes > 0 ? "pendiente" : ""}`}
                >
                  {agenda?.pendientes > 0
                    ? `Tienes ${agenda.pendientes} ${agenda.pendientes === 1 ? "solicitud pendiente" : "solicitudes pendientes"} → Ver citas`
                    : "Ir a Mi agenda →"}
                </Link>
                <p className="mipagina-nota">
                  Las visitas se cuentan una vez por persona y por sesión, sin sumar las tuyas. Las agendas son las
                  citas que aceptaste este mes.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Vista Usuarios */}
        <main className="mipagina-lienzo-wrap">
          <div className="mipagina-modos">
            <div className="mipagina-segmento" role="group" aria-label="Modo de la página">
              <button type="button" className={!enPrevia ? "activo" : ""} aria-pressed={!enPrevia} onClick={() => setVista("editar")}>
                Editar
              </button>
              <button type="button" className={enPrevia ? "activo" : ""} aria-pressed={enPrevia} onClick={() => setVista("previa")}>
                Vista previa
              </button>
            </div>
            {enPrevia && (
              <div className="mipagina-segmento" role="group" aria-label="Dispositivo">
                <button
                  type="button"
                  className={dispositivo === "escritorio" ? "activo" : ""}
                  aria-pressed={dispositivo === "escritorio"}
                  onClick={() => setDispositivo("escritorio")}
                >
                  Escritorio
                </button>
                <button
                  type="button"
                  className={dispositivo === "celular" ? "activo" : ""}
                  aria-pressed={dispositivo === "celular"}
                  onClick={() => setDispositivo("celular")}
                >
                  Celular
                </button>
              </div>
            )}
          </div>
          {enPrevia && (
            <p className="mipagina-nota-previa">Así verán tu página los demás. Los botones no funcionan en la vista previa.</p>
          )}

          <div className={`mipagina-marco ${enPrevia && dispositivo === "celular" ? "previa-movil" : ""}`}>
            <PaginaLienzo
              editor={!enPrevia}
              estilo={form}
              nombre={form.nombre}
              descripcion={form.descripcion}
              onCambiarNombre={enPrevia ? undefined : (valor) => cambiar({ nombre: valor })}
              onCambiarDescripcion={enPrevia ? undefined : (valor) => cambiar({ descripcion: valor })}
              mostrarAgendar={enPrevia ? !agenda || agendaLista : true}
              avatarUrl={form.foto ? getImagenUrl(form.foto) : null}
              iniciales={iniciales}
              accionPortada={
                enPrevia ? null : (
                  <div className="pagina-portada-acciones">
                    <label className="pagina-portada-btn" title="Funciona mejor con una imagen ancha">
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
                )
              }
              accionAvatar={
                enPrevia ? null : (
                  <>
                    <label
                      className="pagina-avatar-edit"
                      title="Cambiar la foto de tu página"
                      aria-label="Cambiar la foto de tu página"
                    >
                      <Icono icon={Pencil} size={14} />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={subiendoClave === "foto"}
                        onChange={handleFoto}
                      />
                    </label>
                    {form.foto && (
                      <button
                        type="button"
                        className="pagina-avatar-quitar"
                        title="Quitar la foto"
                        aria-label="Quitar la foto de la página"
                        onClick={() => cambiar({ foto: null })}
                      >
                        <Icono icon={IconoCerrar} size={14} />
                      </button>
                    )}
                  </>
                )
              }
            >
              {enPrevia && form.bloques.map((bloque) => <BloqueVista key={bloque.id} bloque={bloque} />)}

              {!enPrevia && form.bloques.length === 0 && (
                <div className="mipagina-vacio">
                  <p>Tu página aún no tiene contenido. Empieza agregando un bloque:</p>
                  <div className="mipagina-vacio-botones">
                    {TIPOS_BLOQUE.map(({ tipo, label }) => (
                      <button type="button" key={tipo} onClick={() => agregarBloque(tipo)}>
                        <Icono icon={ICONOS_BLOQUE[tipo]} size={16} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!enPrevia &&
                form.bloques.map((bloque, i) => (
                  <React.Fragment key={bloque.id}>
                    {i > 0 && (
                      <InsertarBloque
                        abierto={insertarEn === i}
                        onAlternar={() => setInsertarEn(insertarEn === i ? null : i)}
                        onElegir={(tipo) => agregarBloque(tipo, i)}
                      />
                    )}
                    <BloqueEditor
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
                  </React.Fragment>
                ))}
            </PaginaLienzo>
          </div>
        </main>
      </div>

      {eliminado && (
        <div className="mipagina-deshacer" role="status">
          <span>Bloque eliminado</span>
          <button type="button" onClick={deshacerEliminar}>
            Deshacer
          </button>
        </div>
      )}

      <Footer />

      {recorte && (
        <AvatarCropper
          imageSrc={recorte.src}
          aspect={recorte.config.aspect}
          anchoSalida={recorte.config.anchoSalida}
          titulo={recorte.config.titulo}
          circular={recorte.config.circular}
          textoConfirmar="Usar imagen"
          onCancel={() => cerrarRecorte(null)}
          onConfirm={(blob) => cerrarRecorte(new File([blob], `${recorte.nombre}.jpg`, { type: "image/jpeg" }))}
        />
      )}
    </div>
  );
}