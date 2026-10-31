import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getUsuarios, updateUsuario, deleteUsuario, createUsuario } from "../services/usuario.services.js";
import { Funnel, Pencil, Trash2 } from "@sketchicon/lucide";
import Icono from "../components/Icono.jsx";
import CampoContrasena from "../components/CampoContrasena.jsx";

import "../styles/Usuario.css";

const ROLES = ["Admin", "Fundador/a", "Residente", "Artista", "Cliente"];

const FORM_NUEVO = {
  nombre_usuario: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  contraseña: "",
  rol: "Cliente",
};

const ROL_DISPLAY = {
  Admin: { label: "Admin", cls: "rol-admin" },
  "Fundador/a": { label: "Fundador/a", cls: "rol-fundador" },
  Residente: { label: "Residente", cls: "rol-residente" },
  Artista: { label: "Artista", cls: "rol-artista" },
  Cliente: { label: "Cliente", cls: "rol-cliente" },
};

export default function Usuario() {
  const { alerta, confirmar } = useAlerta();
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [rolFiltro, setRolFiltro] = useState("");
  const [rolInput, setRolInput] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(null);
  const [creando, setCreando] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios({
        rol: rolFiltro,
        busqueda: busquedaAplicada,
        page,
        limit: 6,
      });
      setUsuarios(data.usuarios);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [rolFiltro, busquedaAplicada, page]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

const usuariosOrdenados = Array.isArray(usuarios) 
    ? [...usuarios].sort((a, b) => {
        const indexA = ROLES.indexOf(a.rol) !== -1 ? ROLES.indexOf(a.rol) : 99;
        const indexB = ROLES.indexOf(b.rol) !== -1 ? ROLES.indexOf(b.rol) : 99;
        return indexA - indexB;
      })
    : [];

  const applyFilters = () => {
    setRolFiltro(rolInput);
    setBusquedaAplicada(busquedaInput);
    setPage(1);
    setShowFilter(false);
  };

  const handleDelete = async (usuario) => {
    const ok = await confirmar(
      `¿Eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`,
      { textoConfirmar: "Eliminar" }
    );
    if (!ok) return;
    try {
      await deleteUsuario(usuario.id_usuario);
      fetchUsuarios();
      alerta("El usuario se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta("No se pudo eliminar el usuario.", { tipo: "error" });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUsuario(editando.id_usuario, {
        nombre: editando.nombre,
        apellido: editando.apellido,
        telefono: editando.telefono,
        rol: editando.rol,
      });
      setEditando(null);
      fetchUsuarios();
      alerta("El usuario se actualizó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta("No se pudo guardar el cambio.", { tipo: "error" });
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await createUsuario(nuevo);
      setNuevo(null);
      setPage(1);
      fetchUsuarios();
      alerta(
        "La cuenta se creó correctamente. Entrégale la contraseña temporal a la persona y pídele que la cambie desde Seguridad.",
        { tipo: "exito", titulo: "Cuenta creada" }
      );
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo crear la cuenta.", { tipo: "error" });
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="usuarios-page">
      <Navbar />

      <div className="usuarios-hero">
        <h1>Usuarios</h1>
        <p>Gestiona las cuentas registradas en Casa Maestra.</p>
      </div>

      <div className="usuarios-wrap">
        <div className="usuarios-toolbar">
          <button type="button" className="btn-primary" onClick={() => setNuevo({ ...FORM_NUEVO })}>
            + Crear usuario
          </button>

          <button className="filter-btn" onClick={() => setShowFilter((v) => !v)} aria-label="Filtrar">
            <Icono icon={Funnel} size={18} />
          </button>

          {showFilter && (
            <div className="filter-popover">
              <label>Rol</label>
              <select value={rolInput} onChange={(e) => setRolInput(e.target.value)}>
                <option value="">Todos</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROL_DISPLAY[r]?.label || r}
                  </option>
                ))}
              </select>

              <label>Buscar</label>
              <input
                type="text"
                placeholder="Nombre, apellido, email o usuario"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />

              <button className="filter-apply-btn" onClick={applyFilters}>
                Aplicar filtros
              </button>
            </div>
          )}
        </div>

        <div className="usuarios-table-wrap">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre de Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && usuariosOrdenados.length > 0 &&
                usuariosOrdenados.map((u) => {
                  const rolInfo = ROL_DISPLAY[u.rol] || { label: u.rol, cls: "rol-cliente" };
                  return (
                    <tr key={u.id_usuario}>
                      <td>{u.nombre_usuario}</td>
                      <td>{u.nombre}</td>
                      <td>{u.apellido || "-----"}</td>
                      <td>{u.email}</td>
                      <td>{u.telefono || "-----"}</td>
                      <td>
                        <span className={`rol-pill ${rolInfo.cls}`}>{rolInfo.label}</span>
                      </td>
                      <td>
                        <div className="acciones-cell">
                          <button className="icon-btn" onClick={() => setEditando(u)} aria-label="Editar">
                            <Icono icon={Pencil} size={18} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDelete(u)}
                            aria-label="Eliminar"
                          >
                            <Icono icon={Trash2} size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {loading && <div className="table-loading">Cargando usuarios...</div>}
          {!loading && error && <div className="table-error">{error}</div>}
          {!loading && !error && usuarios.length === 0 && (
            <div className="table-empty">No se encontraron usuarios con estos filtros.</div>
          )}
        </div>

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </div>
      </div>

      <Footer />

      {editando && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditando(null)}>
          <div className="modal-box">
            <h2>Editar usuario</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-field">
                <label>Nombre</label>
                <input
                  value={editando.nombre}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Apellido</label>
                <input
                  value={editando.apellido || ""}
                  onChange={(e) => setEditando({ ...editando, apellido: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Teléfono</label>
                <input
                  value={editando.telefono || ""}
                  onChange={(e) => setEditando({ ...editando, telefono: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Rol</label>
                <select
                  value={editando.rol}
                  onChange={(e) => setEditando({ ...editando, rol: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROL_DISPLAY[r]?.label || r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {nuevo && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setNuevo(null)}>
          <div className="modal-box modal-box-ancho">
            <h2>Crear usuario</h2>
            <p className="modal-ayuda">
              Úsalo cuando una persona no pueda registrarse por su cuenta. La contraseña es temporal:
              pídele que la cambie desde Seguridad.
            </p>

            <form onSubmit={handleCrear}>
              <div className="modal-field">
                <label htmlFor="nuevo-nombre_usuario">Nombre de usuario</label>
                <input
                  id="nuevo-nombre_usuario"
                  value={nuevo.nombre_usuario}
                  onChange={(e) => setNuevo({ ...nuevo, nombre_usuario: e.target.value })}
                  minLength={3}
                  maxLength={50}
                  required
                />
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label htmlFor="nuevo-nombre">Nombre</label>
                  <input
                    id="nuevo-nombre"
                    value={nuevo.nombre}
                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                    minLength={3}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="nuevo-apellido">Apellido</label>
                  <input
                    id="nuevo-apellido"
                    value={nuevo.apellido}
                    onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })}
                    minLength={3}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label htmlFor="nuevo-email">Correo electrónico</label>
                  <input
                    id="nuevo-email"
                    type="email"
                    value={nuevo.email}
                    onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                    maxLength={200}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="nuevo-telefono">Teléfono</label>
                  <input
                    id="nuevo-telefono"
                    type="tel"
                    inputMode="numeric"
                    placeholder="912345678"
                    value={nuevo.telefono}
                    onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value.replace(/\D/g, "") })}
                    pattern="9[0-9]{8}"
                    title="Debe tener 9 dígitos y comenzar con 9"
                    maxLength={9}
                    required
                  />
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label htmlFor="nuevo-contraseña">Contraseña temporal</label>
                  <CampoContrasena
                    id="nuevo-contraseña"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={nuevo.contraseña}
                    onChange={(e) => setNuevo({ ...nuevo, contraseña: e.target.value })}
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="nuevo-rol">Rol</label>
                  <select
                    id="nuevo-rol"
                    value={nuevo.rol}
                    onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROL_DISPLAY[r]?.label || r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setNuevo(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={creando}>
                  {creando ? "Creando..." : "Crear cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}