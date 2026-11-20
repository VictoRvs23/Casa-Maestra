import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Icono from "../components/Icono.jsx";
import AgendarModal from "../components/AgendarModal.jsx";
import { getOfertaPublica } from "../services/agendaResidente.services.js";
import PaginaLienzo from "../components/pagina/PaginaLienzo.jsx";
import BloqueVista from "../components/pagina/BloqueVista.jsx";
import { ArrowLeft } from "@sketchicon/lucide";
import { useAlerta } from "../context/AlertaContext.jsx";
import { useAuth } from "../context/AuthContext";
import {
  getMisSeguidos,
  getResumenSeguidores,
  seguirResidente,
  dejarDeSeguirResidente,
} from "../services/seguidos.services.js";
import { getPaginaPublica, registrarVisitaPagina, getImagenUrl, getMiPagina } from "../services/pagina.services.js";
import { textoSobre, detalleLegible } from "../constants/paginaEstilos.js";
import "../styles/pagina/PaginaResidente.css";

export default function PaginaResidente() {
  const { slug } = useParams();
  const { alerta } = useAlerta();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seguimiento, setSeguimiento] = useState({ id_residente: null, seguidores: 0, siguiendo: false });
  const [cambiandoSeguir, setCambiandoSeguir] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [agendaAbierta, setAgendaAbierta] = useState(false);
  const [miSlug, setMiSlug] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    getPaginaPublica(slug)
      .then((data) => {
        if (cancelado) return;
        if (data.residente?.slug && data.residente.slug !== slug) {
          navigate(`/residentes/${data.residente.slug}`, { replace: true });
          return;
        }
        setDatos(data);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error(err);
        setError(
          err.response?.status === 404
            ? err.response.data?.message || "Esta página no está disponible."
            : "No se pudo cargar la página."
        );
      })
      .finally(() => !cancelado && setLoading(false));

    return () => {
      cancelado = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!datos) return;
    const clave = `visita-${slug}-${user?.id_usuario ?? "anonimo"}`;
    try {
      if (sessionStorage.getItem(clave)) return;
    } catch {
    }
    registrarVisitaPagina(slug)
      .then(() => {
        try {
          sessionStorage.setItem(clave, "1");
        } catch {
        }
      })
      .catch(() => {});
  }, [datos, slug, user?.id_usuario]);

  useEffect(() => {
    if (!datos) return;
    let cancelado = false;

    const cargarSeguimiento = async () => {
      try {
        const resumen = await getResumenSeguidores(slug);
        let siguiendo = false;
        if (user) {
          const mios = await getMisSeguidos();
          siguiendo = mios.some((m) => m.residente.id_residente === resumen.id_residente);
        }
        if (!cancelado) setSeguimiento({ ...resumen, siguiendo });
      } catch (err) {
        console.error(err);
      }
    };

    cargarSeguimiento();
    return () => {
      cancelado = true;
    };
  }, [datos, slug, user]);

  useEffect(() => {
    if (user?.rol !== "Residente") {
      setMiSlug(null);
      return;
    }
    let cancelado = false;
    getMiPagina()
      .then(({ residente }) => !cancelado && setMiSlug(residente?.slug || null))
      .catch(() => !cancelado && setMiSlug(null));
    return () => {
      cancelado = true;
    };
  }, [user?.rol, user?.id_usuario]);

  const esPropia = Boolean(miSlug && datos?.residente?.slug === miSlug);

  useEffect(() => {
    if (!datos) return;
    let cancelado = false;
    getOfertaPublica(slug)
      .then((oferta) => !cancelado && setAgendaAbierta(Boolean(oferta.agenda_abierta)))
      .catch(() => !cancelado && setAgendaAbierta(false));
    return () => {
      cancelado = true;
    };
  }, [datos, slug]);

  const handleSeguir = async () => {
    if (!user) {
      alerta("Inicia sesión para seguir a este residente.", { tipo: "info", titulo: "Inicia sesión" });
      navigate("/login");
      return;
    }
    if (seguimiento.id_residente == null || cambiandoSeguir) return;

    setCambiandoSeguir(true);
    try {
      const resultado = seguimiento.siguiendo
        ? await dejarDeSeguirResidente(seguimiento.id_residente)
        : await seguirResidente(seguimiento.id_residente);
      setSeguimiento((prev) => ({ ...prev, siguiendo: resultado.siguiendo, seguidores: resultado.seguidores }));
    } catch (err) {
      alerta(err.response?.data?.message || "No se pudo actualizar el seguimiento.", { tipo: "error" });
    } finally {
      setCambiandoSeguir(false);
    }
  };

  const handleAgendar = () => {
    if (!user) {
      alerta("Inicia sesión para agendar con este residente.", { tipo: "info", titulo: "Inicia sesión" });
      navigate("/login");
      return;
    }
    if (esPropia) {
      navigate("/mi-agenda");
      return;
    }
    setAgendando(true);
  };

  const iniciales = datos
    ? datos.residente.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "";

  const acento = datos?.pagina.color_acento;
  const conFoto = Boolean(datos?.pagina.portada);
  const acentoOscuro = datos ? textoSobre(acento) === "#ffffff" : false;

  const tinta = conFoto || acentoOscuro ? "#ffffff" : "#2b1f15";
  const textoBoton = tinta === "#ffffff" ? detalleLegible(acento, "#ffffff") : "#ffffff";

  const colores = datos
    ? {
        backgroundColor: datos.pagina.color_fondo,
        "--acento": acento,
        "--texto-acento": textoSobre(acento),
        "--tinta": tinta,
        "--texto-boton": textoBoton,
      }
    : undefined;

  const clases = [
    "pagina-publica-page",
    datos && "con-pagina",
    conFoto && "con-foto",
    datos && tinta === "#ffffff" && "cabecera-clara",
    datos && acentoOscuro && "pie-claro",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={clases} style={colores}>
      <div className="pagina-publica-cabecera">
        <Navbar />
      </div>

      {loading && <p className="estado-msg pagina-publica-estado">Cargando página...</p>}

      {!loading && error && (
        <div className="pagina-publica-estado">
          <p className="estado-msg estado-error">{error}</p>
          <Link to="/residentes" className="pagina-volver-simple" aria-label="Volver a residentes" title="Volver a residentes">
            <Icono icon={ArrowLeft} size={18} />
          </Link>
        </div>
      )}

      {!loading && datos && (
        <PaginaLienzo
          estilo={datos.pagina}
          nombre={datos.residente.nombre}
          descripcion={datos.residente.descripcion}
          avatarUrl={datos.pagina.foto ? getImagenUrl(datos.pagina.foto) : null}
          iniciales={iniciales}
          accionPortada={
            <Link to="/residentes" className="pagina-volver" aria-label="Volver a residentes" title="Volver a residentes">
              <Icono icon={ArrowLeft} size={18} />
            </Link>
          }
          onAgendar={handleAgendar}
          mostrarAgendar={agendaAbierta || esPropia}
          onSeguir={handleSeguir}
          siguiendo={seguimiento.siguiendo}
          seguidores={seguimiento.seguidores}
        >
          {datos.pagina.bloques.map((bloque) => (
            <BloqueVista key={bloque.id} bloque={bloque} />
          ))}
        </PaginaLienzo>
      )}

      <div className="pagina-publica-pie">
        <Footer />
      </div>

      {agendando && <AgendarModal slug={slug} onCerrar={() => setAgendando(false)} />}
    </div>
  );
}