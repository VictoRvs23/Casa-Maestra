"use strict";

export const MAX_HORAS_POR_RESERVA = 4;
export const ZONA_HORARIA = "America/Santiago";

const pad = (n) => String(n).padStart(2, "0");

export const aMinutos = (hora) => {
    const [h, m] = String(hora).split(":");
    return Number(h) * 60 + Number(m);
};

export const aHora = (minutos) => `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;

export const normalizarHora = (hora) => String(hora).slice(0, 5);

export const esFechaValida = (fecha) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const [y, m, d] = fecha.split("-").map(Number);
    const f = new Date(Date.UTC(y, m - 1, d));
    return f.getUTCFullYear() === y && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
};

export const diaSemanaDe = (fecha) => {
    const [y, m, d] = fecha.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const ahoraEnChile = (ahora = new Date()) => {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_HORARIA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(ahora);
    const get = (tipo) => partes.find((p) => p.type === tipo).value;
    return {
        fecha: `${get("year")}-${get("month")}-${get("day")}`,
        minutos: Number(get("hour")) * 60 + Number(get("minute")),
    };
};

export const fechasDelMes = (mes) => {
    const [y, m] = mes.split("-").map(Number);
    const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Array.from({ length: total }, (_, i) => `${mes}-${pad(i + 1)}`);
};

export const generarHoras = (bloques) => {
    const horas = new Map();
    for (const b of bloques) {
        const fin = aMinutos(b.hora_fin);
        for (let t = aMinutos(b.hora_inicio); t + 60 <= fin; t += 60) {
            horas.set(t, { inicio: t, fin: t + 60 });
        }
    }
    return [...horas.values()].sort((a, b) => a.inicio - b.inicio);
};


export const chocaConReservas = (inicio, fin, reservas) =>
    reservas.some((r) => aMinutos(r.hora_inicio) < fin && aMinutos(r.hora_fin) > inicio);

export const estadoDeLasHoras = ({ fecha, bloques, reservas, ahora }) => {
    return generarHoras(bloques).map((h) => {
        let estado = "libre";
        if (fecha < ahora.fecha || (fecha === ahora.fecha && h.inicio <= ahora.minutos)) {
            estado = "pasada";
        } else if (chocaConReservas(h.inicio, h.fin, reservas)) {
            estado = "ocupada";
        }
        return { hora_inicio: aHora(h.inicio), hora_fin: aHora(h.fin), estado };
    });
};

export const validarRango = ({ fecha, hora_inicio, hora_fin, bloques, reservas, ahora }) => {
    const inicio = aMinutos(hora_inicio);
    const fin = aMinutos(hora_fin);

    if (fin <= inicio) {
        return { status: 400, message: "La hora de fin debe ser posterior a la hora de inicio." };
    }
    if ((fin - inicio) % 60 !== 0) {
        return { status: 400, message: "Las reservas son por horas completas." };
    }
    if ((fin - inicio) / 60 > MAX_HORAS_POR_RESERVA) {
        return { status: 400, message: `Puedes reservar hasta ${MAX_HORAS_POR_RESERVA} horas seguidas.` };
    }

    const estados = new Map(
        estadoDeLasHoras({ fecha, bloques, reservas, ahora }).map((h) => [aMinutos(h.hora_inicio), h.estado])
    );

    for (let t = inicio; t < fin; t += 60) {
        const estado = estados.get(t);
        if (!estado) return { status: 400, message: "Ese horario no está disponible en la agenda del Estudio 0." };
        if (estado === "pasada") return { status: 400, message: "No puedes reservar una hora que ya pasó." };
        if (estado === "ocupada") return { status: 409, message: "Alguna de esas horas ya fue reservada por otra persona." };
    }
    return null;
};