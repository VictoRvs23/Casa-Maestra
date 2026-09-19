import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import { getUsuario } from "../services/usuario.services.js";
import { IoPersonOutline, IoLockClosedOutline, IoCalendarOutline, IoHeartOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import DatosPersonales from "../components/perfil/DatosPersonales.jsx";
import Seguridad from "../components/perfil/Serguridad.jsx";
import "../styles/Perfil.css";


export default function Perfil() {
  const { user } = useAuth();

  const [tab, setTab] = useState("datos");
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id_usuario) return;
    getUsuario(user.id_usuario)
      .then(setPerfil)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const iniciales = perfil
    ? `${perfil.nombre?.[0] || ""}${perfil.apellido?.[0] || ""}`.toUpperCase()
    : "";

  if (loading || !perfil) {
    return (
      <div className="perfil-page">
        <Navbar />
        <p className="estado-msg">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <Navbar />

      <div className="perfil-wrap">
        <div className="perfil-sidebar">
          <div className="perfil-avatar-wrap">
            <div className="perfil-avatar">{iniciales}</div>
            <div className="perfil-avatar-edit" title="Próximamente">
              <AiOutlineEdit size={14} />
            </div>
          </div>

          <div className="perfil-tabs">
            <button className={tab === "datos" ? "active" : ""} onClick={() => setTab("datos")}>
              <IoPersonOutline size={17} /> Datos Personales
            </button>
            <button className={tab === "seguridad" ? "active" : ""} onClick={() => setTab("seguridad")}>
              <IoLockClosedOutline size={17} /> Seguridad
            </button>
            <button className={tab === "reservas" ? "active" : ""} onClick={() => setTab("reservas")}>
              <IoCalendarOutline size={17} /> Mis reservas
            </button>
            <button className={tab === "seguidos" ? "active" : ""} onClick={() => setTab("seguidos")}>
              <IoHeartOutline size={17} /> Seguidos
            </button>
          </div>
        </div>

        <div className="perfil-content">
          {tab === "datos" && <DatosPersonales perfil={perfil} onGuardado={setPerfil} />}
          {tab === "seguridad" && <Seguridad userId={perfil.id_usuario} />}
          {tab === "reservas" && <MisReservas />}
          {tab === "seguidos" && <Seguidos />}
        </div>
      </div>
    </div>
  );
}