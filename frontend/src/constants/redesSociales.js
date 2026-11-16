import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

export const REDES_SOCIALES = [
  { id: "instagram", etiqueta: "Instagram", texto: "casamaestra_cl", icono: FaInstagram, url: "https://www.instagram.com/casamaestra_cl/" },
  { id: "tiktok", etiqueta: "TikTok", texto: "", icono: FaTiktok, url: "" },
  { id: "facebook", etiqueta: "Facebook", texto: "", icono: FaFacebookF, url: "" },
  { id: "youtube", etiqueta: "YouTube", texto: "", icono: FaYoutube, url: "" },
  { id: "whatsapp", etiqueta: "WhatsApp", texto: "", icono: FaWhatsapp, url: "" },
  { id: "telefono", etiqueta: "Teléfono", texto: "9 95713061", icono: FaPhone, url: "tel:+56995713061" },
  { id: "correo", etiqueta: "Correo", texto: "casamaestra@gmail.com", icono: SiGmail, url: "mailto:casamaestra@gmail.com" },
];