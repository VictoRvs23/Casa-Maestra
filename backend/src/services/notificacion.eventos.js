import { AppDataSource } from "../config/configDb.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import {
    ROLES_STAFF,
    crearNotificacionService,
    crearNotificacionParaVariosService,
    crearOActualizarNoLeidaService,
    crearOActualizarParaVariosService,
    idsPorRol,
} from "./notificacion.services.js";

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export const detalleReserva = ({ fecha, hora_inicio, hora_fin }) => {
    const dia = new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
    return `${dia.replace(/\./g, "")}, ${String(hora_inicio).slice(0, 5)} a ${String(hora_fin).slice(0, 5)}`;
};

const nombreDe = async (id_usuario) => {
    const u = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
    return u ? `${u.nombre} ${u.apellido}`.trim() : "Un usuario";
};

const alStaff = async (id_actor) => (await idsPorRol(ROLES_STAFF)).filter((id) => id !== parseInt(id_actor));

export const notificarReservaConfirmada = (id_usuario, detalle) =>
    crearNotificacionService(id_usuario, {
        tipo: "reserva_confirmada",
        titulo: "Reserva confirmada",
        mensaje: `Tu reserva quedó confirmada: ${detalle}.`,
        enlace: "/perfil?tab=reservas",
    });

export const notificarReservaCancelada = (id_usuario, detalle, canceladaPorOtro = false) =>
    crearNotificacionService(id_usuario, {
        tipo: "reserva_cancelada",
        titulo: "Reserva cancelada",
        mensaje: canceladaPorOtro
            ? `Un administrador canceló tu reserva: ${detalle}.`
            : `Cancelaste tu reserva: ${detalle}.`,
        enlace: "/perfil?tab=reservas",
    });

export const notificarNuevoSeguidor = (id_usuario_residente, totalSeguidores) =>
    crearOActualizarNoLeidaService(id_usuario_residente, {
        tipo: "nuevo_seguidor",
        titulo: "Tienes un nuevo seguidor",
        mensaje:
            totalSeguidores === 1
                ? "Alguien empezó a seguir tu página. Ya tienes 1 seguidor."
                : `Alguien empezó a seguir tu página. Ya tienes ${totalSeguidores} seguidores.`,
        enlace: "/mi-pagina",
    });

export const notificarCambioContrasena = (id_usuario) =>
    crearNotificacionService(id_usuario, {
        tipo: "cambio_contrasena",
        titulo: "Cambiaste tu contraseña",
        mensaje: "Si no fuiste tú, contacta a un fundador de inmediato.",
        enlace: "/perfil?tab=seguridad",
    });

export const notificarCambioCorreo = (id_usuario) =>
    crearNotificacionService(id_usuario, {
        tipo: "cambio_correo",
        titulo: "Cambió el correo de tu cuenta",
        mensaje: "Si no fuiste tú, contacta a un fundador de inmediato.",
        enlace: "/perfil?tab=datos-personales",
    });

export const notificarCambioRol = (id_usuario, rolNuevo) =>
    crearNotificacionService(id_usuario, {
        tipo: "cambio_rol",
        titulo: "Cambió el rol de tu cuenta",
        mensaje: `Ahora tu cuenta tiene el rol de ${rolNuevo}.`,
        enlace: "/perfil?tab=datos-personales",
    });

export const notificarBienvenida = (id_usuario, nombre) =>
    crearNotificacionService(id_usuario, {
        tipo: "bienvenida",
        titulo: `¡Bienvenido/a a Casa Maestra, ${nombre}!`,
        mensaje: "Conoce a nuestros residentes, reserva el Estudio 0 o escríbenos desde Soporte si necesitas ayuda.",
        enlace: "/residentes",
        clave: "bienvenida",
    });

export const recordatorioReserva = (id_usuario, reserva) =>
    crearNotificacionService(id_usuario, {
        tipo: "reserva_recordatorio",
        titulo: "Tu reserva es mañana",
        mensaje: `Te recordamos tu reserva en el Estudio 0: ${detalleReserva(reserva)}.`,
        enlace: "/perfil?tab=reservas",
        clave: `recordatorio:${reserva.id_reserva}`,
    });

export const notificarStaffReservaNueva = async (id_actor, reserva) => {
    const quien = await nombreDe(id_actor);
    await crearNotificacionParaVariosService(await alStaff(id_actor), {
        tipo: "staff_reserva_nueva",
        titulo: "Nueva reserva en el Estudio 0",
        mensaje: `${quien} reservó: ${detalleReserva(reserva)}.`,
        enlace: "/estudio0",
    });
};

export const notificarStaffReservaCancelada = async (id_actor, id_duenio, reserva) => {
    const quien = await nombreDe(id_duenio);
    await crearNotificacionParaVariosService(await alStaff(id_actor), {
        tipo: "staff_reserva_cancelada",
        titulo: "Reserva cancelada en el Estudio 0",
        mensaje: `Se canceló la reserva de ${quien}: ${detalleReserva(reserva)}.`,
        enlace: "/estudio0",
    });
};

export const notificarNuevosHorarios = async () => {
    const clientes = await idsPorRol(["Cliente"]);
    await crearOActualizarParaVariosService(clientes, {
        tipo: "nuevos_horarios",
        titulo: "Hay nuevos horarios en el Estudio 0",
        mensaje: "Se habilitaron nuevas horas para reservar. ¡Revisa la disponibilidad!",
        enlace: "/estudio0",
    });
};

export const notificarNuevoTicket = async (id_actor, ticket) => {
    const quien = await nombreDe(id_actor);
    await crearNotificacionParaVariosService(await alStaff(id_actor), {
        tipo: "ticket_nuevo",
        titulo: `Nuevo ticket: ${ticket.asunto}`,
        mensaje: `${ticket.categoria} · de ${quien}.`,
        enlace: "/soporte",
    });
};

export const notificarTicketRespondido = (id_duenio, ticket) =>
    crearNotificacionService(id_duenio, {
        tipo: "ticket_respondido",
        titulo: "Respondieron tu ticket",
        mensaje: `Tu ticket "${ticket.asunto}" tiene una respuesta (estado: ${ticket.estado}).`,
        enlace: "/soporte",
    });

export const notificarTicketCambioEstado = (id_duenio, ticket) =>
    crearNotificacionService(id_duenio, {
        tipo: "ticket_estado",
        titulo: "Tu ticket cambió de estado",
        mensaje: `Tu ticket "${ticket.asunto}" ahora está: ${ticket.estado}.`,
        enlace: "/soporte",
    });
