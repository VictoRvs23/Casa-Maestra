import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import { getUsuario, uploadAvatar, getAvatarUrl } from "../services/usuario.services.js";
import { IoPersonOutline, IoLockClosedOutline, IoCalendarOutline, IoHeartOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import DatosPersonales from "../components/perfil/DatosPersonales.jsx";
import Seguridad from "../components/perfil/Seguridad.jsx";
import MisReservas from "../components/perfil/MisReservas.jsx";
import Seguidos from "../components/perfil/Seguidos.jsx";
import AvatarCropper from "../components/perfil/AvatarCropper.jsx";
import "../styles/Perfil.css";

const TABS_VALIDAS = ["datos-personales", "seguridad", "reservas", "seguidos"];

export default function Perfil() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabInicial = TABS_VALIDAS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "datos-personales";
  const [tab, setTab] = useState(tabInicial);

  useEffect(() => {
    const tabDeUrl = searchParams.get("tab");
    if (TABS_VALIDAS.includes(tabDeUrl) && tabDeUrl !== tab) {
      setTab(tabDeUrl);
    }
  }, [searchParams]);

  const cambiarTab = (nuevaTab) => {
    setTab(nuevaTab);
    setSearchParams({ tab: nuevaTab });
  };

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [imagenParaRecortar, setImagenParaRecortar] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSeleccionarAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenParaRecortar(URL.createObjectURL(file));
    e.target.value = "";
  };

  const cerrarRecortador = () => {
    if (imagenParaRecortar) URL.revokeObjectURL(imagenParaRecortar);
    setImagenParaRecortar(null);
  };

  const handleConfirmarRecorte = async (blob) => {
    setSubiendoAvatar(true);
    try {
      const archivoRecortado = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const { usuario } = await uploadAvatar(perfil.id_usuario, archivoRecortado);
      setPerfil(usuario);
      cerrarRecortador();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo subir la foto de perfil.");
    } finally {
      setSubiendoAvatar(false);
    }
  };

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
            {perfil.avatar ? (
              <img
                src={getAvatarUrl(perfil.avatar)}
                alt="Foto de perfil"
                className="perfil-avatar perfil-avatar-img"
              />
            ) : (
              <div className="perfil-avatar">{iniciales}</div>
            )}

            <button
              type="button"
              className="perfil-avatar-edit"
              title="Cambiar foto"
              onClick={() => fileInputRef.current?.click()}
            >
              <AiOutlineEdit size={14} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSeleccionarAvatar}
              hidden
            />
          </div>

          <div className="perfil-tabs">
            <button className={tab === "datos-personales" ? "active" : ""} onClick={() => cambiarTab("datos-personales")}>
              <IoPersonOutline size={17} /> Datos Personales
            </button>
            <button className={tab === "seguridad" ? "active" : ""} onClick={() => cambiarTab("seguridad")}>
              <IoLockClosedOutline size={17} /> Seguridad
            </button>
            <button className={tab === "reservas" ? "active" : ""} onClick={() => cambiarTab("reservas")}>
              <IoCalendarOutline size={17} /> Mis reservas
            </button>
            <button className={tab === "seguidos" ? "active" : ""} onClick={() => cambiarTab("seguidos")}>
              <IoHeartOutline size={17} /> Seguidos
            </button>
          </div>
        </div>

        <div className="perfil-content">
          {tab === "datos-personales" && <DatosPersonales perfil={perfil} onGuardado={setPerfil} />}
          {tab === "seguridad" && <Seguridad userId={perfil.id_usuario} />}
          {tab === "reservas" && <MisReservas />}
          {tab === "seguidos" && <Seguidos />}
        </div>
      </div>

      {imagenParaRecortar && (
        <AvatarCropper
          imageSrc={imagenParaRecortar}
          onCancel={cerrarRecortador}
          onConfirm={handleConfirmarRecorte}
        />
      )}

      {subiendoAvatar && <p className="estado-msg">Subiendo foto...</p>}
    </div>
  );
}