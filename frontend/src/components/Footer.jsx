import React from "react";
import { FaInstagram } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import "../styles/Tema.css";

const Footer = () => (
  <footer className="pie-pagina">
    <div className="divisor-hojas" role="presentation" aria-hidden="true" />
    <div className="pie-pagina-contenido">
      <span className="pie-pagina-item"><FaInstagram size={20} /> casamaestra_cl</span>
      <span className="pie-pagina-item"><FaPhone size={18} /> 9 11111111</span>
      <span className="pie-pagina-item"><SiGmail size={20} /> casamaestra@gmail.com</span>
    </div>
  </footer>
);

export default Footer;