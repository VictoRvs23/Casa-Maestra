import React from 'react';
import { Link } from 'react-router-dom';
import logoCasaMaestra from '../assets/logoCasaMaestra.png';
import { IoIosNotifications } from "react-icons/io";
import { IoPersonCircleOutline } from "react-icons/io5";
import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar-container">
            <div className="navbar-left">
                <Link to="/">
            <img src={logoCasaMaestra} alt="Logo Casa Maestra" className="navbar-logo" />
            </Link>
            <ul className="navbar-links">
                <li><Link to="/estudios">Estudios</Link></li>
                <li><Link to="/estudio0">Estudio 0</Link></li>
                <li><Link to="/residentes">Residentes</Link></li>
                <li><a href="#soporte">Soporte</a></li>
            </ul>
        </div>

        <div className="navbar-right">
            <button className="campana-btn">
                <IoIosNotifications size={24} />
            </button>
        
            <Link to="/login" className="nav-login-btn">
            <IoPersonCircleOutline size={22} /> Registrar/Iniciar Sesion
            </Link>
        </div>
        </nav>
    );
};

export default Navbar;