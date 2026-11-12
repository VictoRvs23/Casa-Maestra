import { AppDataSource } from "../config/configDb.js";
import ArriendoEntity from "../entities/arriendo.entity.js";
import EstudioEntity from "../entities/estudio.entity.js";
import { ahoraEnChile } from "../helpers/horarios.helper.js";
import {
    MAX_MESES_POR_ARRIENDO,
    MESES_VISIBLES,
    diferenciaMeses,
    listaDeMeses,
    mesesDelRango,
    rangoDeArriendo,
} from "../helpers/meses.helper.js";

const arriendoRepository = AppDataSource.getRepository(ArriendoEntity);
const estudioRepository = AppDataSource.getRepository(EstudioEntity);

const mesActualEnChile = () => ahoraEnChile().fecha.slice(0, 7);

export const getDisponibilidadArriendosService = async (cantidad = MESES_VISIBLES) => {
    const desde = mesActualEnChile();
    const meses = listaDeMeses(desde, cantidad);
    const ultimaFecha = rangoDeArriendo(meses[meses.length - 1], 1).fecha_fin;

    const arriendos = await arriendoRepository
        .createQueryBuilder("a")
        .innerJoin("a.estudio", "e")
        .select(["a.id_arriendo", "a.fecha_inicio", "a.fecha_fin", "e.id_estudio"])
        .where("a.estado = 'confirmada'")
        .andWhere("e.tipo_arriendo = 'mensual'")
        .andWhere("a.fecha_inicio <= :hasta", { hasta: ultimaFecha })
        .andWhere("a.fecha_fin >= :desde", { desde: `${desde}-01` })
        .getMany();

    const ocupados = {};
    for (const a of arriendos) {
        const id = a.estudio.id_estudio;
        ocupados[id] = ocupados[id] || new Set();
        mesesDelRango(a.fecha_inicio, a.fecha_fin)
            .filter((m) => meses.includes(m))
            .forEach((m) => ocupados[id].add(m));
    }

    return {
        meses,
        ocupados: Object.fromEntries(Object.entries(ocupados).map(([id, set]) => [id, [...set].sort()])),
    };
};

export const crearArriendoService = async (id_usuario, { id_estudio, mes_inicio, meses }) => {
    const estudio = await estudioRepository.findOneBy({ id_estudio: parseInt(id_estudio) });
    if (!estudio) throw { status: 404, message: "Estudio no encontrado." };
    if (estudio.tipo_arriendo !== "mensual") {
        throw { status: 400, message: "Este estudio no se arrienda por mes." };
    }
    if (!estudio.disponible) {
        throw { status: 409, message: "Este estudio no está disponible por ahora." };
    }

    const actual = mesActualEnChile();
    const diferencia = diferenciaMeses(actual, mes_inicio);
    if (diferencia < 0) throw { status: 400, message: "No puedes arrendar un mes que ya pasó." };
    if (diferencia >= MESES_VISIBLES) {
        throw { status: 400, message: `Solo puedes arrendar hasta ${MESES_VISIBLES} meses hacia adelante.` };
    }
    if (meses < 1 || meses > MAX_MESES_POR_ARRIENDO) {
        throw { status: 400, message: `Puedes arrendar de 1 a ${MAX_MESES_POR_ARRIENDO} meses seguidos.` };
    }

    const { fecha_inicio, fecha_fin } = rangoDeArriendo(mes_inicio, meses);

    return await AppDataSource.transaction(async (manager) => {
        await manager.query("SELECT pg_advisory_xact_lock($1, $2)", [2, estudio.id_estudio]);

        const repo = manager.getRepository(ArriendoEntity);

        const choque = await repo
            .createQueryBuilder("a")
            .where("a.id_estudio = :id", { id: estudio.id_estudio })
            .andWhere("a.estado = 'confirmada'")
            .andWhere("a.fecha_inicio <= :fin AND a.fecha_fin >= :inicio", { inicio: fecha_inicio, fin: fecha_fin })
            .getCount();

        if (choque > 0) {
            throw {
                status: 409,
                message: "Alguno de esos meses ya está arrendado. Elige otro período.",
            };
        }

        const guardado = await repo.save(
            repo.create({
                mes_inicio: `${mes_inicio}-01`,
                meses,
                fecha_inicio,
                fecha_fin,
                total: estudio.precio * meses,
                estado: "confirmada",
                estudio: { id_estudio: estudio.id_estudio },
                usuario: { id_usuario: parseInt(id_usuario) },
            })
        );

        return { ...guardado, estudio: { id_estudio: estudio.id_estudio, nombre: estudio.nombre } };
    });
};

export const cancelarArriendoService = async (id_arriendo, id_usuario, rolUsuario) => {
    const arriendo = await arriendoRepository.findOne({
        where: { id_arriendo: parseInt(id_arriendo) },
        relations: ["usuario"],
    });
    if (!arriendo) throw { status: 404, message: "Arriendo no encontrado." };
    if (arriendo.estado === "cancelada") throw { status: 409, message: "Este arriendo ya está cancelado." };

    const hoy = ahoraEnChile().fecha;
    const esDueño = String(arriendo.usuario.id_usuario) === String(id_usuario);
    const esGestor = rolUsuario === "Admin" || rolUsuario === "Fundador/a";

    if (!esDueño && !esGestor) {
        throw { status: 403, message: "No puedes cancelar un arriendo que no es tuyo." };
    }
    if (arriendo.fecha_fin < hoy) {
        throw { status: 409, message: "Este arriendo ya terminó." };
    }
    if (!esGestor && arriendo.fecha_inicio <= hoy) {
        throw { status: 409, message: "Este arriendo ya comenzó. Escríbenos por Soporte para cancelarlo." };
    }

    await arriendoRepository.update(arriendo.id_arriendo, { estado: "cancelada" });
    return true;
};

export const getMisArriendosService = async (id_usuario) => {
    return await arriendoRepository.find({
        where: { usuario: { id_usuario: parseInt(id_usuario) } },
        relations: ["estudio"],
        order: { fecha_inicio: "DESC" },
    });
};

export const PERIODOS_ARRIENDOS = ["activos", "finalizados", "cancelados", "todos"];

const aplicarPeriodo = (qb, periodo, hoy) => {
    switch (periodo) {
        case "activos":
            return qb.andWhere("a.estado = 'confirmada'").andWhere("a.fecha_fin >= :hoy", { hoy });
        case "finalizados":
            return qb.andWhere("a.estado = 'confirmada'").andWhere("a.fecha_fin < :hoy", { hoy });
        case "cancelados":
            return qb.andWhere("a.estado = 'cancelada'");
        default:
            return qb;
    }
};

export const getArriendosService = async ({ periodo = "activos", page = 1, limit = 10 }) => {
    const hoy = ahoraEnChile().fecha;

    const qb = arriendoRepository
        .createQueryBuilder("a")
        .leftJoin("a.usuario", "u")
        .leftJoin("a.estudio", "e")
        .select([
            "a.id_arriendo",
            "a.mes_inicio",
            "a.meses",
            "a.fecha_inicio",
            "a.fecha_fin",
            "a.total",
            "a.estado",
            "a.created_at",
            "u.id_usuario",
            "u.nombre",
            "u.apellido",
            "u.email",
            "u.telefono",
            "e.id_estudio",
            "e.nombre",
        ]);

    aplicarPeriodo(qb, periodo, hoy);

    const orden = periodo === "activos" ? "ASC" : "DESC";
    const [arriendos, total] = await qb
        .orderBy("a.fecha_inicio", orden)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    const cuentas = {};
    for (const p of PERIODOS_ARRIENDOS) {
        cuentas[p] = await aplicarPeriodo(arriendoRepository.createQueryBuilder("a"), p, hoy).getCount();
    }

    return { arriendos, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), cuentas };
};