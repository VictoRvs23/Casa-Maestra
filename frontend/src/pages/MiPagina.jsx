import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import PaginaLienzo from "../components/pagina/PaginaLienzo.jsx";
import BloqueEditor from "../components/pagina/BloqueEditor.jsx";
import { IconoTexto, IconoImagen, IconoGaleria, IconoSeparador, IconoWeb, IconoCamara, IconoCerrar } from "../components/pagina/iconos.js";
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
} from "../constants/paginaEstilos.js";
import "../styles/pagina/MiPagina.css";

const ICONOS_BLOQUE = {
  texto: IconoTexto,
  imagen: IconoImagen,
  galeria: IconoGaleria,
  separador: IconoSeparador,
  redes: IconoWeb,
};

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

const aFormulario = (pagina) => ({
  publicada: pagina.publicada,
  color_acento: pagina.color_acento,
  color_fondo: pagina.color_fondo,
  fuente: pagina.fuente,
  portada: pagina.portada,
  bloques: pagina.bloques,
});

const bloqueTieneContenido = (b) => {
  switch (b.tipo) {
    case "texto": return b.contenido.trim() !== "";
    case "imagen": return Boolean(b.url);
    case "galeria": return b.imagenes.some(Boolean);
    case "redes": return Boolean(b.instagram || b.email || b.web);
    default: return false;
  }
};

export default function MiPagina() {
  const { alerta, confirmar } = useAlerta();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null); // { residente, usuario }
  const [form, setForm] = useState(null); // lo que se está editando
  const [guardado, setGuardado] = useState(null); // lo último que está en el servidor
  const [guardando, setGuardando] = useState(false);
  const [subiendoClave, setSubiendoClave] = useState(null);

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
    setForm((f) => ({ ...f, bloques: [...f.bloques, crearBloque(tipo)] }));
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

      <div className="mipagina-hero">
        <h1>Mi página</h1>
        <p>Diseña tu página a tu gusto</p>
      </div>

      <div className="mipagina-wrap">
        <section className="mipagina-card" aria-labelledby="mp-bloques">
          <h2 id="mp-bloques">Agregar bloque</h2>
          <div className="mipagina-bloques-botones">
            {TIPOS_BLOQUE.map(({ tipo, label }) => (
              <button type="button" key={tipo} className="mipagina-bloque-btn" onClick={() => agregarBloque(tipo)}>
                <Icono icon={ICONOS_BLOQUE[tipo]} size={20} /> {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mipagina-card" aria-labelledby="mp-estilo">
          <h2 id="mp-estilo">Personaliza tu página</h2>

          <div className="mipagina-colores">
            <div>
              <h3>Color de detalles</h3>
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
            </div>

            <div>
              <h3>Fondo de página</h3>
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
            </div>
          </div>

          <div>
            <h3>Fuente</h3>
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
        </section>

        <section className="mipagina-stats" aria-labelledby="mp-stats">
          <h2 id="mp-stats">Estadísticas</h2>
          <div className="mipagina-stats-grid">
            {ESTADISTICAS_EJEMPLO.map((e, i) => (
              <article className="estadistica-card" key={e.etiqueta} style={{ "--giro": ["-1deg", "0.8deg", "-0.6deg"][i] }}>
                <p className="estadistica-etiqueta">{e.etiqueta}</p>
                <p className="estadistica-valor">{e.valor}</p>
              </article>
            ))}
          </div>
          <p className="mipagina-nota">Valores de ejemplo: se conectarán a datos reales más adelante.</p>
        </section>

        <section aria-labelledby="mp-prev">
          <div className="mipagina-prev-cabecera">
            <h2 id="mp-prev">Vista previa</h2>

            <div className="mipagina-prev-acciones">
              {guardado.publicada && (
                <Link to={`/residentes/${residente.slug}`} className="mipagina-ver-link">
                  Ver mi página
                </Link>
              )}

              <div className="mipagina-publicar">
                <span>{form.publicada ? "Publicado" : "Borrador"}</span>
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
              <p className="estado-msg">Todavía no hay bloques. Agrega uno con los botones de arriba.</p>
            )}

            {form.bloques.map((bloque, i) => (
              <BloqueEditor
                key={bloque.id}
                bloque={bloque}
                esPrimero={i === 0}
                esUltimo={i === form.bloques.length - 1}
                subiendoClave={subiendoClave}
                onCambiar={(cambios) => cambiarBloque(bloque.id, cambios)}
                onSubirImagen={subirImagen}
                onMover={(direccion) => moverBloque(bloque.id, direccion)}
                onEliminar={() => eliminarBloque(bloque)}
              />
            ))}
          </PaginaLienzo>
        </section>
      </div>

      <Footer />
    </div>
  );
}