import { AppDataSource } from "../config/configDb.js";
import ReservaEntity from "../entities/reserva.entity.js";
import { ahoraEnChile, aMinutos } from "../helpers/horarios.helper.js";
import { recordatorioReserva } from "./notificacion.eventos.js";

const reservaRepository = AppDataSource.getRepository(ReservaEntity);

const CADA_MS = 10 * 60 * 1000;
const VENTANA_MIN = 23 * 60;
const VENTANA_MAX = 24 * 60;

const sumarDia = (fecha, dias) => {
    const d = new Date(`${fecha}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
};

export const enviarRecordatorios = async () => {
    try {
        const ahora = ahoraEnChile();
        const manana = sumarDia(ahora.fecha, 1);

        const reservas = await reservaRepository.find({
            where: [
                { estado: "confirmada", fecha: ahora.fecha },
                { estado: "confirmada", fecha: manana },
                { estado: "confirmada", fecha: sumarDia(ahora.fecha, 2) },
            ],
            relations: { usuario: true },
            select: {
                id_reserva: true,
                fecha: true,
                hora_inicio: true,
                hora_fin: true,
                usuario: { id_usuario: true },
            },
        });

        for (const r of reservas) {
            const dias = (new Date(`${r.fecha}T12:00:00Z`) - new Date(`${ahora.fecha}T12:00:00Z`)) / 86400000;
            const faltan = dias * 1440 + aMinutos(r.hora_inicio) - ahora.minutos;
            if (faltan > VENTANA_MIN && faltan <= VENTANA_MAX) {
                await recordatorioReserva(r.usuario.id_usuario, r);
            }
        }
    } catch (error) {
        console.error("No se pudieron enviar los recordatorios:", error.message);
    }
};

export const iniciarRecordatorios = () => {
    if (process.env.NODE_ENV === "test") return null;
    enviarRecordatorios();
    return setInterval(enviarRecordatorios, CADA_MS);
};
