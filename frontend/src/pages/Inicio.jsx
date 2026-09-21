import React from "react";
import Navbar from "../components/NavBar.jsx";
import { FaInstagram } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import "../styles/Inicio.css";
import ceramicaImg from "../assets/categorias/ceramica.jpg";
import pinturaImg from "../assets/categorias/pintura.jpg";
import relajacionImg from "../assets/categorias/relajacion.jpg";
import carpinteriaImg from "../assets/categorias/carpinteria.jpg";
import tatuajesImg from "../assets/categorias/tatuajes.jpg";
import piercingsImg from "../assets/categorias/piercings.jpg";
import estampadoImg from "../assets/categorias/estampado-textil.jpg";
import bordadoImg from "../assets/categorias/bordado.jpg";

const CATEGORIAS = [
  { name: "Cerámica", img: ceramicaImg },
  { name: "Pintura", img: pinturaImg },
  { name: "Relajación", img: relajacionImg },
  { name: "Carpintería", img: carpinteriaImg },
  { name: "Tatuajes", img: tatuajesImg },
  { name: "Piercings", img: piercingsImg },
  { name: "Estampado Textil", img: estampadoImg },
  { name: "Bordado", img: bordadoImg },
];

const Inicio = () => {
  const categories = CATEGORIAS;

  return (
    <div className="inicio-container">
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">CASA MAESTRA</h1>
          <p className="hero-subtitle">Explora talleres, modificaciones corporales y más</p>
          <div className="hero-buttons">
            <button className="hero-btn">Conoce nuestros talleres</button>
            <button className="hero-btn">Conoce a nuestros artistas</button>
          </div>
        </div>
      </section>

      <section className="categories-section">
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div className="category-card" key={index}>
                <div className="category-img-wrapper">
                  <img src={cat.img} alt={cat.name} className="category-img" />
                </div>
                <h3 className="category-title">{cat.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-categories">
            <p>Próximamente nuevos talleres disponibles. ¡Mantente atento!</p>
          </div>
        )}
      </section>

      <footer className="inicio-footer">
        <div className="footer-content">
          <span className="footer-item"><FaInstagram size={20} /> casamaestra_cl</span>
          <span className="footer-item"><FaPhone size={18} /> 9 11111111</span>
          <span className="footer-item"><SiGmail size={20} /> casamaestra@gmail.com</span>
        </div>
      </footer>
    </div>
  );
};

export default Inicio;