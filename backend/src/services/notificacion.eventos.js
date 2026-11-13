import {
    crearNotificacionService,
    crearOActualizarNoLeidaService,
} from "./notificacion.services.js";

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