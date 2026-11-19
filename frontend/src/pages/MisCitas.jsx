import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CitasLista from "../components/CitasLista.jsx";
import { useAuth } from "../context/AuthContext";
import { useAlerta } from "../context/AlertaContext.jsx";
import { getMisCitas, cancelarCita } from "../services/agendaResidente.services.js";
import "../styles/MiAgenda.css";

export default function MisCitas() {
    const { user, loading: cargandoSesion } = useAuth();
    const { alerta, confirmar } = useAlerta();
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [ocupada, setOcupada] = useState(false);

    const cargar = useCallback(async () => {
        try {
        const data = await getMisCitas();
        setCitas(data.citas);
        setError(null);
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "No se pudieron cargar tus citas.");
        } finally {
        setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (!cargandoSesion && user) cargar();
    }, [cargandoSesion, user, cargar]);

    if (cargandoSesion) return null;
    if (!user) return <Navigate to="/login" replace />;

    const handleCancelar = async (c) => {
        const ok = await confirmar(`¿Cancelar «${c.nombre_servicio}»? Le avisaremos al residente.`, {
        textoConfirmar: "Cancelar cita",
        });
        if (!ok) return;
        setOcupada(true);
        try {
        await cancelarCita(c.id_cita);
        await cargar();
        alerta("Se canceló la cita.", { tipo: "exito" });
        } catch (err) {
        alerta(err.response?.data?.message || "No se pudo cancelar.", { tipo: "error" });
        } finally {
        setOcupada(false);
        }
    };

    return (
        <div className="ma-page">
        <Navbar />

        <div className="ma-hero">
            <h1>Mis citas</h1>
            <p>Las solicitudes que hiciste a los residentes y su estado.</p>
            <Link to="/residentes" className="ma-link">Ver residentes</Link>
        </div>

        <main className="ma-main">
            {cargando && <p className="ma-estado">Cargando tus citas...</p>}
            {!cargando && error && <p className="ma-estado ma-error">{error}</p>}
            {!cargando && !error && <CitasLista citas={citas} vista="cliente" ocupada={ocupada} onCancelar={handleCancelar} />}
        </main>

        <Footer />
        </div>
    );
}