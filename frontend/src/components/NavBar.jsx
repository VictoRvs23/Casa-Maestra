import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoCasaMaestra from "../assets/logoCasaMaestra.png";
import { IoIosNotifications } from "react-icons/io";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate("/");
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
                    {(user?.rol === "Admin" || user?.rol === "Fundador/a") && (
                        <li><Link to="/usuarios">Usuarios</Link></li>
                    )}
                </ul>
            </div>

            <div className="navbar-right">
                <button className="campana-btn">
                    <IoIosNotifications size={24} />
                </button>

                {user ? (
                    <div className="account-menu" ref={menuRef}>
                        <button className="nav-account-btn" onClick={() => setMenuOpen((v) => !v)}>
                            <IoPersonCircleOutline size={22} /> Mi Cuenta
                        </button>

                        {menuOpen && (
                            <div className="account-dropdown">
                                <div className="account-dropdown-username">
                                    {user.nombre_usuario || user.nombre}
                                </div>
                                <div className="account-dropdown-divider"></div>
                                <Link to="/perfil" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                                    Datos Personales
                                </Link>
                                <Link to="/perfil?tab=seguridad" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                                    Seguridad
                                </Link>
                                <Link to="/perfil?tab=reservas" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                                    Mis Reservas
                                </Link>
                                <Link to="/perfil?tab=favoritos" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                                    Mis favoritos
                                </Link>
                                <div className="account-dropdown-divider"></div>
                                <button className="account-dropdown-item account-dropdown-logout" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
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