import React from 'react';
import { Link } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
import logoCasaMaestra from '../assets/logoCasaMaestra.png';
import '../styles/AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout-backdrop">
      <div className="auth-modal-box">
        
        <Link to="/" className="close-modal-btn">
          <IoClose size={28} />
        </Link>

        <div className="auth-layout-left">
          <img 
            src={logoCasaMaestra} 
            alt="Logo Casa Maestra" 
            className="auth-layout-logo"
          />
        </div>
        
        <div className="auth-layout-right">
          <div className="auth-form-wrapper">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthLayout;