import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

export const REDES_SOCIALES = [
  { id: "instagram", etiqueta: "Instagram", texto: "casamaestra_cl", icono: FaInstagram, url: "https://www.instagram.com/casamaestra_cl/" },
  { id: "tiktok", etiqueta: "TikTok", texto: "casamaestra_cl", icono: FaTiktok, url: "https://www.tiktok.com/@casamaestra_cl" },
  { id: "facebook", etiqueta: "Facebook", texto: "", icono: FaFacebookF, url: "" },
  { id: "youtube", etiqueta: "YouTube", texto: "", icono: FaYoutube, url: "" },
  { id: "whatsapp", etiqueta: "WhatsApp", texto: "Casa Maestra", icono: FaWhatsapp, url: "https://wa.me/56995713061" },
  { id: "telefono", etiqueta: "Teléfono", texto: "", icono: FaPhone, url: "" },
  { id: "correo", etiqueta: "Correo", texto: "casamaestra.ccp1@gmail.com", icono: SiGmail, url: "mailto:casamaestra.ccp1@gmail.com" },
];