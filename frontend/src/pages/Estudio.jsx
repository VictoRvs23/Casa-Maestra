import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import {
  getEstudios,
  createEstudio,
  updateEstudio,
  deleteEstudio,
  getImagenUrl,
} from "../services/estudio.services.js";
import { getDisponibilidadArriendos, crearArriendo } from "../services/arriendo.services.js";
import { Search, User, Pencil, Trash2, Ruler, CircleCheck, CircleX } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import "../styles/Estudio.css";

const ESTADO_INICIAL_FORM = {
  nombre: "",
  descripcion: "",
  capacidad: "",
  ancho_metros: "",
  largo_metros: "",
  precio: "",
  disponible: true,
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const nombreMes = (mes) => `${MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;
const mesCorto = (mes) => MESES[Number(mes.slice(5, 7)) - 1].slice(0, 3);
const mesNombreLargo = (mes) => {
  const n = nombreMes(mes);
  return n.charAt(0).toUpperCase() + n.slice(1);
};
const sumarMeses = (mes, n) => {
  const total = Number(mes.slice(0, 4)) * 12 + (Number(mes.slice(5, 7)) - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
};
const plata = (n) => `$${Number(n).toLocaleString("es-CL")}`;

export default function Estudios() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alerta, confirmar } = useAlerta();
  const puedeGestionar = user?.rol === "Fundador/a" || user?.rol === "Admin";

  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [capacidadFiltro, setCapacidadFiltro] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [imagenArchivo, setImagenArchivo] = useState(null);

  // Arriendo mensual
  const [disp, setDisp] = useState(null); // { meses: [...], ocupados: { id: [...] } }
  const [arrendando, setArrendando] = useState(null); // estudio que se está arrendando
  const [arriendoForm, setArriendoForm] = useState({ mes_inicio: "", meses: 1 });
  const [enviandoArriendo, setEnviandoArriendo] = useState(false);

  const fetchEstudios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstudios({
        tipo_arriendo: "mensual",
        capacidad: capacidadFiltro,
        busqueda: busquedaAplicada,
        limit: 24,
      });
      setEstudios(data.estudios);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los estudios.");
    } finally {
      setLoading(false);
    }
  }, [capacidadFiltro, busquedaAplicada]);

  useEffect(() => {
    fetchEstudios();
  }, [fetchEstudios]);

  const fetchDisponibilidad = useCallback(async () => {
    try {
      setDisp(await getDisponibilidadArriendos());
    } catch (err) {
      console.error(err);
      setDisp(null);
    }
  }, []);

  useEffect(() => {
    fetchDisponibilidad();
  }, [fetchDisponibilidad]);

  const mesesLibres = useCallback(
    (id_estudio) => {
      if (!disp) return [];
      const ocupados = new Set(disp.ocupados[id_estudio] || []);
      return disp.meses.filter((m) => !ocupados.has(m));
    },
    [disp]
  );

  const maxMesesDesde = useCallback(
    (id_estudio, inicio) => {
      const libres = new Set(mesesLibres(id_estudio));
      let n = 0;
      while (n < 12 && libres.has(sumarMeses(inicio, n))) n++;
      return n;
    },
    [mesesLibres]
  );

  const aplicarBusqueda = () => setBusquedaAplicada(busquedaInput);

  const abrirCrear = () => {
    setEditandoId(null);
    setForm(ESTADO_INICIAL_FORM);
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (estudio) => {
    setEditandoId(estudio.id_estudio);
    setForm({
      nombre: estudio.nombre,
      descripcion: estudio.descripcion || "",
      capacidad: estudio.capacidad,
      ancho_metros: estudio.ancho_metros,
      largo_metros: estudio.largo_metros,
      precio: estudio.precio,
      disponible: estudio.disponible,
    });
    setImagenArchivo(null);
    setModalAbierto(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("capacidad", Number(form.capacidad));
    formData.append("ancho_metros", Number(form.ancho_metros));
    formData.append("largo_metros", Number(form.largo_metros));
    formData.append("precio", Number(form.precio));
    formData.append("tipo_arriendo", "mensual");
    formData.append("disponible", form.disponible);

    if (imagenArchivo) {
      formData.append("imagen", imagenArchivo);
    }

    try {
      if (editandoId) {
        await updateEstudio(editandoId, formData);
      } else {
        await createEstudio(formData);
      }
      setModalAbierto(false);
      fetchEstudios();
      alerta(
        editandoId ? "El estudio se actualizó correctamente." : "El estudio se creó correctamente.",
        { tipo: "exito" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo guardar el estudio.", { tipo: "error" });
    }
  };

  const handleEliminar = async (estudio) => {
    const ok = await confirmar(`¿Eliminar "${estudio.nombre}"? Esta acción no se puede deshacer.`, {
      textoConfirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await deleteEstudio(estudio.id_estudio);
      fetchEstudios();
      alerta("El estudio se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta("No se pudo eliminar el estudio.", { tipo: "error" });
    }
  };

  const handleReservar = (estudio) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const libres = mesesLibres(estudio.id_estudio);
    if (libres.length === 0) {
      alerta("Este estudio no tiene meses libres por ahora.", { tipo: "info", titulo: "Sin disponibilidad" });
      return;
    }
    setArriendoForm({ mes_inicio: libres[0], meses: 1 });
    setArrendando(estudio);
  };

  const cambiarMesInicio = (mes_inicio) => {
    const max = maxMesesDesde(arrendando.id_estudio, mes_inicio);
    setArriendoForm((f) => ({ mes_inicio, meses: Math.min(f.meses, max) || 1 }));
  };

  const confirmarArriendo = async (e) => {
    e.preventDefault();
    setEnviandoArriendo(true);
    try {
      await crearArriendo({
        id_estudio: arrendando.id_estudio,
        mes_inicio: arriendoForm.mes_inicio,
        meses: Number(arriendoForm.meses),
      });
      const nombre = arrendando.nombre;
      setArrendando(null);
      alerta(
        `Tu arriendo de ${nombre} quedó confirmado desde ${nombreMes(arriendoForm.mes_inicio)}.`,
        { tipo: "exito", titulo: "Arriendo confirmado" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo crear el arriendo.", { tipo: "error" });
    } finally {
      setEnviandoArriendo(false);
      fetchDisponibilidad();
    }
  };

  const resumenArriendo = useMemo(() => {
    if (!arrendando || !arriendoForm.mes_inicio) return null;
    const n = Number(arriendoForm.meses);
    const ultimo = sumarMeses(arriendoForm.mes_inicio, n - 1);
    return {
      desde: mesNombreLargo(arriendoForm.mes_inicio),
      hasta: mesNombreLargo(ultimo),
      total: arrendando.precio * n,
      max: maxMesesDesde(arrendando.id_estudio, arriendoForm.mes_inicio),
    };
  }, [arrendando, arriendoForm, maxMesesDesde]);

  return (
    <div className="estudios-page">
      <Navbar />

      <div className="estudios-hero">
        <h1>Estudios</h1>
        <p>Reserva el espacio adecuado para tu oficio: salas equipadas por hora, día o taller completo.</p>
      </div>

      <div className="estudios-wrap">
        <div className="estudios-filters">
          <div className="filter-field">
            <label>Capacidad mínima</label>
            <select value={capacidadFiltro} onChange={(e) => setCapacidadFiltro(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="2">2 o más personas</option>
              <option value="6">6 o más personas</option>
              <option value="10">10 o más personas</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Buscar por nombre</label>
            <input
              type="text"
              placeholder="Ej: Estudio 2"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarBusqueda()}
            />
          </div>

          <button className="search-btn" onClick={aplicarBusqueda} aria-label="Buscar">
            <Icono icon={Search} size={20} />
          </button>

          {user && (
            <button className="arriendos-link" onClick={() => navigate("/estudios/arriendos")}>
              {puedeGestionar ? "Ver arriendos" : "Mis arriendos"}
            </button>
          )}

          {puedeGestionar && (
            <button className="create-btn" onClick={abrirCrear}>
              + Crear estudio
            </button>
          )}
        </div>

        {loading && <p className="estado-msg">Cargando estudios...</p>}
        {!loading && error && <p className="estado-msg estado-error">{error}</p>}
        {!loading && !error && estudios.length === 0 && (
          <p className="estado-msg">No hay estudios que coincidan con tu búsqueda.</p>
        )}

        <div className="estudios-lista">
          {!loading && !error && estudios.map((estudio) => {
            const libres = mesesLibres(estudio.id_estudio);
            const ocupados = new Set(disp?.ocupados[estudio.id_estudio] || []);
            const libreAhora = disp && libres[0] === disp.meses[0];
            const textoDisp = !estudio.disponible
              ? "No disponible por ahora"
              : !disp
                ? ""
                : libres.length === 0
                  ? "Sin meses libres por ahora"
                  : libreAhora
                    ? "Disponible desde este mes"
                    : `Libre desde ${nombreMes(libres[0])}`;

            return (
              <article className="estudio-card estudio-h" key={estudio.id_estudio}>
                <div
                  className="estudio-img"
                  style={estudio.imagen ? { backgroundImage: `url(${getImagenUrl(estudio.imagen)})` } : undefined}
                >
                  <span className="estudio-badge">{estudio.nombre}</span>
                  <span className={`estado-icono ${estudio.disponible ? "libre" : "ocupado"}`}>
                    {estudio.disponible ? <Icono icon={CircleCheck} size={22} /> : <Icono icon={CircleX} size={22} />}
                  </span>
                </div>

                <div className="estudio-info estudio-h-info">
                  <p className="estudio-h-desc">
                    {estudio.descripcion || "Espacio de trabajo para arriendo mensual."}
                  </p>

                  <div className="estudio-h-datos">
                    <p>
                      <span className="ico"><Icono icon={User} size={18} /></span> {estudio.capacidad} Personas
                    </p>
                    <p>
                      <span className="ico"><Icono icon={Ruler} size={18} /></span> {estudio.ancho_metros} x {estudio.largo_metros} metros
                      {" "}({(estudio.ancho_metros * estudio.largo_metros).toFixed(0)} m²)
                    </p>
                  </div>

                  {disp && estudio.disponible && (
                    <div className="estudio-meses">
                      <span className="estudio-meses-titulo">{textoDisp}</span>
                      <ul aria-label="Disponibilidad de los próximos meses">
                        {disp.meses.map((m) => (
                          <li
                            key={m}
                            className={ocupados.has(m) ? "ocupado" : "libre"}
                            title={`${mesNombreLargo(m)}: ${ocupados.has(m) ? "arrendado" : "libre"}`}
                          >
                            {mesCorto(m)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!disp || !estudio.disponible) && textoDisp && (
                    <p className="estudio-meses-titulo">{textoDisp}</p>
                  )}

                  <div className="estudio-footer">
                    <span className="estudio-precio">
                      {plata(estudio.precio)} / mensuales
                    </span>
                    <button
                      className="reservar-btn"
                      disabled={!estudio.disponible || (disp && libres.length === 0)}
                      onClick={() => handleReservar(estudio)}
                    >
                      {user ? "Arrendar" : "Inicia sesión para arrendar"}
                    </button>
                  </div>

                  {puedeGestionar && (
                    <div className="admin-actions">
                      <button onClick={() => abrirEditar(estudio)}>
                        <Icono icon={Pencil} size={18} /> Editar
                      </button>
                      <button onClick={() => handleEliminar(estudio)} className="danger">
                        <Icono icon={Trash2} size={18} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Footer />

      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalAbierto(false)}>
          <div className="modal-box">
            <h2>{editandoId ? "Editar estudio" : "Crear estudio"}</h2>
            <form onSubmit={handleGuardar}>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleFormChange} required />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleFormChange} rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacidad (personas)</label>
                  <input type="number" name="capacidad" min="1" value={form.capacidad} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Precio mensual (CLP)</label>
                  <input type="number" name="precio" min="0" value={form.precio} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ancho (m)</label>
                  <input type="number" name="ancho_metros" min="0" step="0.1" value={form.ancho_metros} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Largo (m)</label>
                  <input type="number" name="largo_metros" min="0" step="0.1" value={form.largo_metros} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Imagen del estudio (opcional)</label>
                <div className="file-upload-container">
                  <label className="custom-file-upload">
                    Subir Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="file-upload-name">
                    {imagenArchivo ? imagenArchivo.name : "Ningún archivo seleccionado"}
                  </span>
                </div>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" name="disponible" checked={form.disponible} onChange={handleFormChange} />
                Disponible para arriendo
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {arrendando && resumenArriendo && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setArrendando(null)}>
          <div className="modal-box">
            <h2>Arrendar {arrendando.nombre}</h2>
            <form onSubmit={confirmarArriendo}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="arriendo-mes">Mes de inicio</label>
                  <select
                    id="arriendo-mes"
                    value={arriendoForm.mes_inicio}
                    onChange={(e) => cambiarMesInicio(e.target.value)}
                  >
                    {mesesLibres(arrendando.id_estudio).map((m) => (
                      <option key={m} value={m}>{mesNombreLargo(m)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="arriendo-cantidad">Cantidad de meses</label>
                  <select
                    id="arriendo-cantidad"
                    value={arriendoForm.meses}
                    onChange={(e) => setArriendoForm((f) => ({ ...f, meses: Number(e.target.value) }))}
                  >
                    {Array.from({ length: resumenArriendo.max }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "mes" : "meses"}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="arriendo-resumen">
                <p>
                  {arriendoForm.meses === 1
                    ? <>Arriendo de <b>{resumenArriendo.desde}</b></>
                    : <>Desde <b>{resumenArriendo.desde}</b> hasta <b>{resumenArriendo.hasta}</b></>}
                </p>
                <p className="arriendo-total">
                  {plata(arrendando.precio)} x {arriendoForm.meses} = <b>{plata(resumenArriendo.total)}</b>
                </p>
                <small>
                  Los meses se arriendan completos. La confirmación es inmediata si siguen libres. El pago se
                  coordina con el equipo de Casa Maestra.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setArrendando(null)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={enviandoArriendo}>
                  {enviandoArriendo ? "Confirmando..." : "Confirmar arriendo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}