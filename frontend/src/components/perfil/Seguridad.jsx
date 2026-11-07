import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { cambiarContrasena, deleteUsuario } from "../../services/usuario.services.js";
import { useAlerta } from "../../context/AlertaContext.jsx";
import CampoContrasena from "../CampoContrasena.jsx";
import "../../styles/perfil/Seguridad.css";

export default function Seguridad({ userId }) {
  const { logout } = useAuth();
  const { alerta, confirmar } = useAlerta();
  const navigate = useNavigate();

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleActualizarContrasena = async (e) => {
    e.preventDefault();

    if (passNueva !== passConfirmar) {
      alerta("La nueva contraseña y su confirmación no coinciden.", { tipo: "advertencia" });
      return;
    }
    if (passNueva.length < 8) {
      alerta("La nueva contraseña debe tener al menos 8 caracteres.", { tipo: "advertencia" });
      return;
    }

    setGuardando(true);
    try {
      await cambiarContrasena(userId, passActual, passNueva);
      alerta("Tu contraseña se actualizó correctamente.", { tipo: "exito" });
      setPassActual("");
      setPassNueva("");
      setPassConfirmar("");
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo actualizar la contraseña.", { tipo: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarCuenta = async () => {
    const ok = await confirmar(
      "¿Eliminar tu cuenta? Esta acción es permanente y no se puede deshacer.",
      { textoConfirmar: "Eliminar cuenta" }
    );
    if (!ok) return;

    try {
      await deleteUsuario(userId);
      logout();
      navigate("/");
      alerta("Tu cuenta se eliminó correctamente.", { tipo: "exito" });
    } catch (err) {
      console.error(err);
      alerta(err.response?.data?.message || "No se pudo eliminar la cuenta.", { tipo: "error" });
    }
  };

  return (
    <>
      <h2>Seguridad</h2>
      <p className="perfil-sub">Gestiona tu contraseña</p>

      <form onSubmit={handleActualizarContrasena}>
        <div className="form-group">
          <label>Contraseña Actual</label>
          <CampoContrasena
            autoComplete="current-password"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nueva contraseña</label>
            <CampoContrasena
              placeholder="Mínimo 8 Caracteres"
              autoComplete="new-password"
              value={passNueva}
              onChange={(e) => setPassNueva(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <CampoContrasena
              conOjo={false}
              autoComplete="new-password"
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