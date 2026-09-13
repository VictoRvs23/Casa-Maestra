import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/NavBar.jsx";
import { getUsuarios, updateUsuario, deleteUsuario } from "../services/usuario.services.js";
import "../styles/Usuario.css";

const ROLES = ["Admin", "Fundador/a", "Residente", "Artista", "Cliente"];

const ROL_DISPLAY = {
  Admin: { label: "Admin", cls: "rol-admin" },
  "Fundador/a": { label: "Fundador/a", cls: "rol-fundador" },
  Residente: { label: "Residente", cls: "rol-residente" },
  Artista: { label: "Artista", cls: "rol-artista" },
  Cliente: { label: "Usuario", cls: "rol-cliente" },
};

export default function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [rolFiltro, setRolFiltro] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [editando, setEditando] = useState(null);

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

  const applyFilters = () => {
    setBusquedaAplicada(busquedaInput);
    setPage(1);
    setShowFilter(false);
  };

  const handleDelete = async (usuario) => {
    const ok = window.confirm(
      `¿Eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await deleteUsuario(usuario.id_usuario);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el usuario.");
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
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el cambio.");
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
          <button className="filter-btn" onClick={() => setShowFilter((v) => !v)} aria-label="Filtrar">
            ▽
          </button>

          {showFilter && (
            <div className="filter-popover">
              <label>Rol</label>
              <select value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)}>
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
              {!loading && !error && usuarios.length > 0 &&
                usuarios.map((u) => {
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
                            ✎
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDelete(u)}
                            aria-label="Eliminar"
                          >
                            🗑
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
    </div>
  );
}