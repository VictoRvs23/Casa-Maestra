import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Inicio from './pages/Inicio.jsx';
import Usuario from './pages/Usuario.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de Inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Ruta de Usuarios */}
        <Route path="/usuarios" element={<Usuario />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;