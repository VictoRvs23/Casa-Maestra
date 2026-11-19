import React, { useEffect, useMemo, useState } from "react";
import { getOfertaPublica, getDisponibilidad, crearCita } from "../services/agendaResidente.services.js";
import { getImagenUrl } from "../services/pagina.services.js";
import "../styles/AgendarModal.css";

const plata = (n) => (n === null || n === undefined ? "A convenir" : `$${Number(n).toLocaleString("es-CL")}`);
const textoDuracion = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (!h) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} ${h === 1 ? "hora" : "horas"}`;
};
const fechaLarga = (fecha) =>
    new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
const diaCorto = (fecha) => {
    const d = new Date(`${fecha}T12:00:00`);
    return {
        semana: d.toLocaleDateString("es-CL", { weekday: "short" }).replace(".", ""),
        numero: d.getDate(),
        mes: d.toLocaleDateString("es-CL", { month: "short" }).replace(".", ""),
    };
};

export default function AgendarModal({ slug, onCerrar, onAgendado }) {
    const [oferta, setOferta] = useState(null);
    const [errorOferta, setErrorOferta] = useState(null);
    const [elegido, setElegido] = useState(null);
    const [cargandoHoras, setCargandoHoras] = useState(false);
    const [dias, setDias] = useState([]);
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState(null);
    const [nota, setNota] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [listo, setListo] = useState(null);

    useEffect(() => {
        getOfertaPublica(slug)
            .then(setOferta)
            .catch((err) => setErrorOferta(err.response?.data?.message || "No se pudo cargar la oferta."));
    }, [slug]);

    useEffect(() => {
        const alTeclear = (e) => e.key === "Escape" && onCerrar();
        window.addEventListener("keydown", alTeclear);
        return () => window.removeEventListener("keydown", alTeclear);
    }, [onCerrar]);

    const elegir = async (s) => {
        setElegido(s);
        setFecha(null);
        setHora(null);
        setError(null);
        setDias([]);
        if (s.tipo !== "servicio") return;
        setCargandoHoras(true);
        try {
        const data = await getDisponibilidad(slug, s.id_servicio);
        setDias(data.dias);
        if (data.dias[0]) setFecha(data.dias[0].fecha);
        } catch (err) {
        setError(err.response?.data?.message || "No se pudieron cargar las horas.");
        } finally {
        setCargandoHoras(false);
        }
    };

    const volver = () => {
        setElegido(null);
        setError(null);
        setNota("");
    };

    const horasDelDia = useMemo(() => dias.find((d) => d.fecha === fecha)?.horas || [], [dias, fecha]);
    const esServicio = elegido?.tipo === "servicio";
    const puedeEnviar = elegido && (!esServicio || (fecha && hora));

    const enviar = async (e) => {
        e.preventDefault();
        if (!puedeEnviar || enviando) return;
        setEnviando(true);
        setError(null);
        try {
        const payload = { id_servicio: elegido.id_servicio, nota: nota.trim() };
        if (esServicio) Object.assign(payload, { fecha, hora_inicio: hora });
        await crearCita(payload);
        setListo({ nombre: elegido.nombre, fecha: esServicio ? fecha : null, hora: esServicio ? hora : null });
        onAgendado?.();
        } catch (err) {
        const mensaje = err.response?.data?.message || "No se pudo enviar la solicitud.";
        setError(mensaje);
        if (err.response?.status === 409 && esServicio) {
            setHora(null);
            try {
            const data = await getDisponibilidad(slug, elegido.id_servicio);
            setDias(data.dias);
            if (!data.dias.some((d) => d.fecha === fecha)) setFecha(data.dias[0]?.fecha || null);
            } catch {
            }
        }
        } finally {
        setEnviando(false);
        }
    };

    return (
        <div className="ag-overlay" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
        <div className="ag-modal" role="dialog" aria-modal="true" aria-label="Agendar">
            <button type="button" className="ag-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
            </button>

            {listo ? (
            <div className="ag-listo">
                <h2>¡Solicitud enviada!</h2>
                <p>
                Pediste <b>{listo.nombre}</b>
                {listo.fecha && (
                    <>
                    {" "}
                    para el <b>{fechaLarga(listo.fecha)}</b> a las <b>{listo.hora}</b>
                    </>
                )}
                .
                </p>
                <p className="ag-ayuda">
                Quedó <b>pendiente</b>: te avisaremos cuando el residente la acepte o la rechace. La puedes ver en «Mis
                citas».
                </p>
                <button type="button" className="btn-primary" onClick={onCerrar}>
                Listo
                </button>
            </div>
            ) : (
            <>
                <h2>{elegido ? "Confirma tu solicitud" : "¿Qué quieres agendar?"}</h2>

                {!oferta && !errorOferta && <p className="ag-estado">Cargando...</p>}
                {errorOferta && <p className="ag-estado ag-error">{errorOferta}</p>}

                {oferta && !elegido && (
                <>
                    {oferta.servicios.length === 0 || !oferta.agenda_abierta ? (
                    <p className="ag-estado">
                        {oferta.residente.nombre} aún no abre su agenda. Vuelve pronto o síguelo para enterarte.
                    </p>
                    ) : (
                    <ul className="ag-lista">
                        {oferta.servicios.map((s) => (
                        <li key={s.id_servicio}>
                            <button type="button" className="ag-opcion" onClick={() => elegir(s)}>
                            <span
                                className={`ag-foto ${s.imagen ? "" : "sin-foto"}`}
                                style={s.imagen ? { backgroundImage: `url(${getImagenUrl(s.imagen)})` } : undefined}
                            />
                            <span className="ag-opcion-texto">
                                <small className={`ag-tipo ${s.tipo}`}>{s.tipo === "servicio" ? "Servicio" : "Producto"}</small>
                                <b>{s.nombre}</b>
                                <span>
                                {plata(s.precio)} ·{" "}
                                {s.tipo === "servicio" ? textoDuracion(s.duracion_min) : "entrega a coordinar"}
                                </span>
                            </span>
                            </button>
                        </li>
                        ))}
                    </ul>
                    )}
                </>
                )}

                {elegido && (
                <form onSubmit={enviar}>
                    <div className="ag-resumen">
                    <div>
                        <b>{elegido.nombre}</b>
                        <span>
                        {plata(elegido.precio)} · {esServicio ? textoDuracion(elegido.duracion_min) : "entrega a coordinar"}
                        </span>
                    </div>
                    <button type="button" className="ag-cambiar" onClick={volver}>
                        Cambiar
                    </button>
                    </div>

                    {esServicio && (
                    <>
                        {cargandoHoras && <p className="ag-estado">Buscando horas libres...</p>}
                        {!cargandoHoras && dias.length === 0 && !error && (
                        <p className="ag-estado">No hay horas libres en los próximos 30 días para este servicio.</p>
                        )}

                        {dias.length > 0 && (
                        <>
                            <span className="ag-label">Elige un día</span>
                            <div className="ag-dias" role="listbox" aria-label="Días disponibles">
                            {dias.map((d) => {
                                const c = diaCorto(d.fecha);
                                return (
                                <button
                                    type="button"
                                    key={d.fecha}
                                    role="option"
                                    aria-selected={fecha === d.fecha}
                                    className={`ag-dia ${fecha === d.fecha ? "activo" : ""}`}
                                    onClick={() => {
                                    setFecha(d.fecha);
                                    setHora(null);
                                    }}
                                >
                                    <small>{c.semana}</small>
                                    <b>{c.numero}</b>
                                    <small>{c.mes}</small>
                                </button>
                                );
                            })}
                            </div>

                            <span className="ag-label">Elige una hora</span>
                            <div className="ag-horas" role="listbox" aria-label="Horas disponibles">
                            {horasDelDia.map((h) => (
                                <button
                                type="button"
                                key={h}
                                role="option"
                                aria-selected={hora === h}
                                className={`ag-hora ${hora === h ? "activo" : ""}`}
                                onClick={() => setHora(h)}
                                >
                                {h}
                                </button>
                            ))}
                            </div>
                        </>
                        )}
                    </>
                    )}

                    <label className="ag-label" htmlFor="ag-nota">
                    {esServicio ? "Cuéntale el motivo (opcional)" : "Mensaje para coordinar la entrega (opcional)"}
                    </label>
                    <textarea
                    id="ag-nota"
                    rows={3}
                    maxLength={300}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder={esServicio ? "Ej: Quiero un piercing en la oreja izquierda" : "Ej: Puedo retirarlo el sábado"}
                    />

                    {!esServicio && (
                    <p className="ag-ayuda">
                        Se aparta el producto y el residente coordina contigo el retiro y el pago. No se cobra nada aquí.
                    </p>
                    )}

                    {error && <p className="ag-error">{error}</p>}

                    <div className="ag-acciones">
                    <button type="button" className="btn-ghost" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={!puedeEnviar || enviando}>
                        {enviando ? "Enviando..." : esServicio ? "Pedir esta hora" : "Apartar"}
                    </button>
                    </div>
                </form>
                )}
            </>
            )}
        </div>
        </div>
    );
}