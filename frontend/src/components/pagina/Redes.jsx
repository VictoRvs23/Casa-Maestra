import React from "react";
import { FaInstagram, FaTiktok, FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa";
import Icono from "../Icono.jsx";
import { IconoCorreo } from "./iconos.js";

const sinArroba = (v) => v.trim().replace(/^@/, "");

export const REDES = [
  {
    clave: "instagram",
    label: "Instagram",
    placeholder: "@tu_usuario",
    max: 30,
    tipo: "text",
    icono: (size) => <FaInstagram size={size} aria-hidden="true" />,
    enlace: (v) => `https://instagram.com/${sinArroba(v)}`,
  },
  {
    clave: "tiktok",
    label: "TikTok",
    placeholder: "@tu_usuario",
    max: 30,
    tipo: "text",
    icono: (size) => <FaTiktok size={size} aria-hidden="true" />,
    enlace: (v) => `https://www.tiktok.com/@${sinArroba(v)}`,
  },
  {
    clave: "facebook",
    label: "Facebook",
    placeholder: "tu.pagina",
    max: 50,
    tipo: "text",
    icono: (size) => <FaFacebookF size={size} aria-hidden="true" />,
    enlace: (v) => `https://facebook.com/${sinArroba(v)}`,
  },
  {
    clave: "youtube",
    label: "YouTube",
    placeholder: "@tucanal",
    max: 40,
    tipo: "text",
    icono: (size) => <FaYoutube size={size} aria-hidden="true" />,
    enlace: (v) => `https://youtube.com/@${sinArroba(v)}`,
  },
  {
    clave: "whatsapp",
    label: "WhatsApp",
    placeholder: "+56 9 1111 1111",
    max: 20,
    tipo: "tel",
    icono: (size) => <FaWhatsapp size={size} aria-hidden="true" />,
    enlace: (v) => `https://wa.me/${v.replace(/\D/g, "")}`,
  },
  {
    clave: "email",
    label: "Correo",
    placeholder: "correo@ejemplo.com",
    max: 200,
    tipo: "email",
    icono: (size) => <Icono icon={IconoCorreo} size={size} />,
    enlace: (v) => `mailto:${v.trim()}`,
  },
];