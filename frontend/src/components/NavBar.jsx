import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoCasaMaestra from '../assets/logoCasaMaestra.png';
import { IoIosNotifications } from "react-icons/io";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                    {(user?.rol === 'Admin' || user?.rol === 'Fundador/a') && (
                        <li><Link to="/usuarios">Usuarios</Link></li>
                    )}
                </ul>
            </div>

            <div className="navbar-right">
                <button className="campana-btn">
                    <IoIosNotifications size={24} />
                </button>

                {user ? (
                    <div className="navbar-account">
                        <Link to="/perfil" className="nav-account-btn">
                            <IoPersonCircleOutline size={22} /> {user.nombre_usuario || user.nombre}
                        </Link>
                        <button className="nav-logout-btn" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="nav-login-btn">
                        <IoPersonCircleOutline size={22} /> Registrar/Iniciar Sesion
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;