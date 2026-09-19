import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cambiarContrasena, deleteUsuario } from "../../services/usuario.services.js";
import "../../styles/perfil/Seguridad.css";

export default function Seguridad({ userId }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleActualizarContrasena = async (e) => {
    e.preventDefault();

    if (passNueva !== passConfirmar) {
      alert("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (passNueva.length < 8) {
      alert("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setGuardando(true);
    try {
      await cambiarContrasena(userId, passActual, passNueva);
      alert("Contraseña actualizada correctamente.");
      setPassActual("");
      setPassNueva("");
      setPassConfirmar("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarCuenta = async () => {
    const ok = window.confirm(
      "¿Eliminar tu cuenta? Esta acción es permanente y no se puede deshacer."
    );
    if (!ok) return;

    try {
      await deleteUsuario(userId);
      logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo eliminar la cuenta.");
    }
  };

  return (
    <>
      <h2>Seguridad</h2>
      <p className="perfil-sub">Gestiona tu contraseña</p>

      <form onSubmit={handleActualizarContrasena}>
        <div className="form-group">
          <label>Contraseña Actual</label>
          <input
            type="password"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 8 Caracteres"
              value={passNueva}
              onChange={(e) => setPassNueva(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={passConfirmar}
              onChange={(e) => setPassConfirmar(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>

      <div className="zona-peligro">
        <h3>Zona de Peligro</h3>
        <p>Esta acción es permanente y no se puede deshacer.</p>
        <button className="btn-danger" onClick={handleEliminarCuenta}>Eliminar Cuenta</button>
      </div>
    </>
  );
}