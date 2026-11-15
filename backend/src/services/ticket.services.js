import { AppDataSource } from "../config/configDb.js";
import TicketEntity from "../entities/ticket.entity.js";
import {
    notificarNuevoTicket,
    notificarTicketRespondido,
    notificarTicketCambioEstado,
} from "./notificacion.eventos.js";

const ticketRepository = AppDataSource.getRepository(TicketEntity);

const CAMPOS_USUARIO = [
    "usuario.id_usuario",
    "usuario.nombre",
    "usuario.apellido",
    "usuario.nombre_usuario",
    "usuario.email",
    "usuario.rol",
];

export const createTicketService = async (id_usuario, data) => {
    const nuevoTicket = ticketRepository.create({
        asunto: data.asunto,
        mensaje: data.mensaje,
        categoria: data.categoria,
        estado: "Abierto",
        usuario: { id_usuario },
    });
    const guardado = await ticketRepository.save(nuevoTicket);

    await notificarNuevoTicket(id_usuario, guardado);

    return guardado;
};

export const getMisTicketsService = async (id_usuario) => {
    return await ticketRepository.find({
        where: { usuario: { id_usuario } },
        order: { created_at: "DESC" },
    });
};

export const getTicketsService = async (query = {}) => {
    const { estado, categoria, busqueda, page = 1, limit = 10 } = query;

    const qb = ticketRepository.createQueryBuilder("ticket")
        .leftJoin("ticket.usuario", "usuario")
        .addSelect(CAMPOS_USUARIO)
        .orderBy("ticket.created_at", "DESC");

    if (estado) qb.andWhere("ticket.estado = :estado", { estado });
    if (categoria) qb.andWhere("ticket.categoria = :categoria", { categoria });

    if (busqueda) {
        qb.andWhere(
            `(ticket.asunto ILIKE :busqueda OR ticket.mensaje ILIKE :busqueda
              OR usuario.nombre ILIKE :busqueda OR usuario.apellido ILIKE :busqueda
              OR usuario.nombre_usuario ILIKE :busqueda OR usuario.email ILIKE :busqueda)`,
            { busqueda: `%${busqueda}%` }
        );
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    qb.skip((pageNum - 1) * limitNum).take(limitNum);

    const [tickets, total] = await qb.getManyAndCount();

    return {
        tickets,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

export const updateTicketService = async (id_ticket, data, id_actor = null) => {
    const ticket = await ticketRepository.findOneBy({ id_ticket: parseInt(id_ticket) });

    if (!ticket) throw { status: 404, message: "Ticket no encontrado" };

    const estadoAnterior = ticket.estado;
    const respuestaAnterior = ticket.respuesta;

    if (data.estado !== undefined) ticket.estado = data.estado;

    if (data.respuesta !== undefined) {
        ticket.respuesta = data.respuesta === "" ? null : data.respuesta;
        ticket.respondido_at = data.respuesta === "" ? null : new Date();
    }

    const guardado = await ticketRepository.save(ticket);

    const conDuenio = await ticketRepository.findOne({
        where: { id_ticket: guardado.id_ticket },
        relations: { usuario: true },
        select: { id_ticket: true, usuario: { id_usuario: true } },
    });
    const id_duenio = conDuenio?.usuario?.id_usuario;

    if (id_duenio && String(id_duenio) !== String(id_actor)) {
        const respuestaNueva = guardado.respuesta && guardado.respuesta !== respuestaAnterior;
        if (respuestaNueva) await notificarTicketRespondido(id_duenio, guardado);
        else if (guardado.estado !== estadoAnterior) await notificarTicketCambioEstado(id_duenio, guardado);
    }

    return guardado;
};