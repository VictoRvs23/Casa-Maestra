import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Inicio from "./pages/Inicio.jsx";
import Usuario from "./pages/Usuario.jsx";
import Estudio from "./pages/Estudio.jsx";
import Perfil from "./pages/Perfil.jsx";
import Residente from "./pages/Residente.jsx";
import Taller from "./pages/Taller.jsx";
import Soporte from "./pages/Soporte.jsx";
import MiPagina from "./pages/MiPagina.jsx";
import PaginaResidente from "./pages/PaginaResidente.jsx";
import Estudio0 from "./pages/Estudio0.jsx";
import Estudio0Agenda from "./pages/Estudio0Agenda.jsx";
import Estudio0Horarios from "./pages/Estudio0Horarios.jsx";
import Estudio0Reservas from "./pages/Estudio0Reservas.jsx";
import EstudiosArriendos from "./pages/EstudioArriendos.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de Inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Ruta de Taller */}
        <Route path="/talleres/:id_taller" element={<Taller />} />

        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Ruta de Residentes */}
        <Route path="/residentes" element={<Residente />} />

        {/* Ruta de Página de Residente */}
        <Route path="/residentes/:slug" element={<PaginaResidente />} />

        {/* Ruta de Mi Página */}
        <Route path="/mi-pagina" element={<MiPagina />} />

        {/* Ruta de Estudios */}
        <Route path="/estudios" element={<Estudio />} />
        <Route path="/estudios/arriendos" element={<EstudiosArriendos />} />

        {/* Rutas de Estudio 0 */}
        <Route path="/estudio0" element={<Estudio0 />} />
        <Route path="/estudio0/agenda" element={<Estudio0Agenda />} />
        <Route path="/estudio0/horarios" element={<Estudio0Horarios />} />
        <Route path="/estudio0/reservas" element={<Estudio0Reservas />} />

        {/* Compatibilidad con la URL anterior */}
        <Route path="/estudios/0" element={<Navigate to="/estudio0" replace />} />

        {/* Ruta de Soporte */}
        <Route path="/soporte" element={<Soporte />} />

        {/* Ruta de Usuarios */}
        <Route path="/usuarios" element={<Usuario />} />

        {/* Ruta de Perfil */}
        <Route path="/perfil" element={<Perfil />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;