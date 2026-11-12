"use strict";

export const MAX_MESES_POR_ARRIENDO = 12;
export const MESES_VISIBLES = 12;

const pad = (n) => String(n).padStart(2, "0");

export const esMesValido = (mes) => {
    if (typeof mes !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return false;
    return true;
};

export const sumarMeses = (mes, n) => {
    const [y, m] = mes.split("-").map(Number);
    const total = y * 12 + (m - 1) + n;
    return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
};

export const diferenciaMeses = (desde, hasta) => {
    const [y1, m1] = desde.split("-").map(Number);
    const [y2, m2] = hasta.split("-").map(Number);
    return (y2 - y1) * 12 + (m2 - m1);
};

export const ultimoDiaDelMes = (mes) => {
    const [y, m] = mes.split("-").map(Number);
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

export const rangoDeArriendo = (mes_inicio, meses) => {
    const ultimoMes = sumarMeses(mes_inicio, meses - 1);
    return {
        fecha_inicio: `${mes_inicio}-01`,
        fecha_fin: `${ultimoMes}-${pad(ultimoDiaDelMes(ultimoMes))}`,
    };
};

export const listaDeMeses = (desde, n) => Array.from({ length: n }, (_, i) => sumarMeses(desde, i));

export const mesesDelRango = (fecha_inicio, fecha_fin) => {
    const desde = fecha_inicio.slice(0, 7);
    const hasta = fecha_fin.slice(0, 7);
    return listaDeMeses(desde, diferenciaMeses(desde, hasta) + 1);
};