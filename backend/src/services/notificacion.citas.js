import { crearNotificacionService } from "./notificacion.services.js";

const fechaLegible = (fecha) =>
    new Date(`${fecha}T12:00:00`)
        .toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })
        .replace(/\./g, "");

export const detalleCita = (c) =>
    c.fecha ? `${c.nombre_servicio}, ${fechaLegible(c.fecha)} a las ${c.hora_inicio}` : c.nombre_servicio;

export const notificarCitaNueva = (id_usuario_residente, cita, cliente) =>
    crearNotificacionService(id_usuario_residente, {
        tipo: "cita_nueva",
        titulo: cita.tipo === "producto" ? "Te pidieron apartar un producto" : "Tienes una solicitud de cita",
        mensaje: `${cliente} pidió: ${detalleCita(cita)}. Acéptala o recházala desde Mi agenda.`,
        enlace: "/mi-agenda?tab=citas",
    });

export const notificarCitaRespondida = (id_cliente, cita, nombreResidente, aceptada) =>
    crearNotificacionService(id_cliente, {
        tipo: aceptada ? "cita_aceptada" : "cita_rechazada",
        titulo: aceptada ? "Tu cita fue aceptada" : "Tu cita fue rechazada",
        mensaje: aceptada
            ? `${nombreResidente} aceptó: ${detalleCita(cita)}.`
            : `${nombreResidente} no pudo aceptar: ${detalleCita(cita)}. Puedes pedir otro horario.`,
        enlace: "/perfil?tab=citas",
    });

export const notificarCitaCancelada = (id_destino, cita, quienCancela, haciaResidente) =>
    crearNotificacionService(id_destino, {
        tipo: "cita_cancelada",
        titulo: "Se canceló una cita",
        mensaje: `${quienCancela} canceló: ${detalleCita(cita)}.`,
        enlace: haciaResidente ? "/mi-agenda?tab=citas" : "/perfil?tab=citas",
    });