import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import PaginaResidenteEntity from "../entities/paginaResidente.entity.js";
import ResidenteEntity from "../entities/residente.entity.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import SeguimientoEntity from "../entities/seguimiento.entity.js";
import { PREFIJO_URL_PAGINA } from "../config/paginaEstilos.js";
import { asegurarTarjetaDeUsuario, buscarPorSlug, cambiosPorNombre } from "./tarjeta.services.js";

const paginaRepository = AppDataSource.getRepository(PaginaResidenteEntity);
const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);
const seguimientoRepository = AppDataSource.getRepository(SeguimientoEntity);

const mesActual = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit" }).format(
        new Date()
    );

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith(PREFIJO_URL_PAGINA)) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

const urlsDePagina = ({ portada, foto, bloques }) => {
    const urls = [];
    if (portada) urls.push(portada);
    if (foto) urls.push(foto);

    for (const bloque of bloques || []) {
        if (bloque.tipo === "imagen" && bloque.url) urls.push(bloque.url);
        if (bloque.tipo === "galeria") {
            for (const url of bloque.imagenes || []) {
                if (url) urls.push(url);
            }
        }
    }
    return urls;
};

const getResidenteDeUsuario = async (id_usuario) => {
    const residente = await residenteRepository.findOneBy({ id_usuario });
    if (residente) return residente;

    const usuario = await usuarioRepository.findOneBy({ id_usuario });
    if (usuario?.rol === "Residente") return (await asegurarTarjetaDeUsuario(usuario)).residente;

    throw {
        status: 404,
        message: "Tu cuenta no tiene una página de residente. Se crea cuando el equipo te asigna el rol Residente.",
    };
};

const getOCrearPagina = async (residente) => {
    let pagina = await paginaRepository.findOneBy({ id_residente: residente.id_residente });

    if (!pagina) {
        pagina = await paginaRepository.save(
            paginaRepository.create({ id_residente: residente.id_residente, bloques: [] })
        );
    }
    return pagina;
};

const datosDeResidente = (r) => ({
    id_residente: r.id_residente,
    nombre: r.nombre,
    descripcion: r.descripcion,
    slug: r.slug,
    activa: r.activa,
});

export const getMiPaginaService = async (id_usuario) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const pagina = await getOCrearPagina(residente);

    const usuario = await usuarioRepository.findOne({
        where: { id_usuario },
        select: { id_usuario: true, nombre: true, apellido: true, nombre_usuario: true, avatar: true },
    });

    const [seguidores, fila] = await Promise.all([
        seguimientoRepository.count({ where: { residente: { id_residente: residente.id_residente } } }),
        paginaRepository
            .createQueryBuilder("p")
            .select("p.visitas", "visitas")
            .where("p.id_residente = :id", { id: residente.id_residente })
            .getRawOne(),
    ]);

    return {
        pagina,
        estadisticas: {
            visitas_mes: Number(fila?.visitas?.[mesActual()] || 0),
            seguidores,
            agendas: null,
        },
        residente: datosDeResidente(residente),
        usuario,
    };
};

export const updateMiPaginaService = async (id_usuario, data) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const pagina = await getOCrearPagina(residente);

    const { nombre, descripcion, ...cambiosPagina } = data;

    const resultado = { ...pagina, ...cambiosPagina };
    const despues = urlsDePagina(resultado);

    const prefijoPropio = `${PREFIJO_URL_PAGINA}pagina-${id_usuario}-`;
    if (despues.some((url) => !url.startsWith(prefijoPropio))) {
        throw { status: 400, message: "Una de las imágenes no pertenece a tu cuenta." };
    }

    const cambiosTarjeta = {};
    if (nombre !== undefined) Object.assign(cambiosTarjeta, await cambiosPorNombre(residente, nombre));
    if (descripcion !== undefined) cambiosTarjeta.descripcion = String(descripcion).trim() || null;

    if ("foto" in cambiosPagina) {
        if (cambiosPagina.foto) {
            cambiosTarjeta.imagen = cambiosPagina.foto;
        } else {
            const cuenta = await usuarioRepository.findOne({ where: { id_usuario }, select: { avatar: true } });
            cambiosTarjeta.imagen = cuenta?.avatar || null;
        }
    }

    if (resultado.publicada) {
        const descripcionFinal = "descripcion" in cambiosTarjeta ? cambiosTarjeta.descripcion : residente.descripcion;
        if (!descripcionFinal) {
            throw {
                status: 400,
                message: "Para publicar, escribe una descripción corta de tu trabajo (aparece en tu tarjeta).",
            };
        }
    }

    const antes = urlsDePagina(pagina);

    if (Object.keys(cambiosTarjeta).length > 0) {
        await residenteRepository.update(residente.id_residente, cambiosTarjeta);
    }

    Object.assign(pagina, cambiosPagina);
    const guardada = await paginaRepository.save(pagina);

    antes.filter((url) => !despues.includes(url)).forEach(borrarImagenLocal);

    const residenteActual = await residenteRepository.findOneBy({ id_residente: residente.id_residente });
    return { pagina: guardada, residente: datosDeResidente(residenteActual) };
};

export const limpiarImagenesDeResidenteService = async (id_residente) => {
    const pagina = await paginaRepository.findOneBy({ id_residente: parseInt(id_residente) });
    if (!pagina) return;
    urlsDePagina(pagina).forEach(borrarImagenLocal);
};

const getVisiblePorSlug = async (slug) => {
    const residente = await buscarPorSlug(slug);
    if (!residente) throw { status: 404, message: "No encontramos a este residente." };

    const pagina = await paginaRepository.findOneBy({ id_residente: residente.id_residente });

    if (!residente.activa || !pagina || !pagina.publicada) {
        throw { status: 404, message: "Esta página aún no está disponible." };
    }
    return { residente, pagina };
};

export const getPaginaPublicaService = async (slug) => {
    const { residente, pagina } = await getVisiblePorSlug(slug);

    return {
        residente: {
            nombre: residente.nombre,
            descripcion: residente.descripcion,
            slug: residente.slug,
        },
        pagina: {
            color_acento: pagina.color_acento,
            color_fondo: pagina.color_fondo,
            fuente: pagina.fuente,
            portada: pagina.portada,
            foto: pagina.foto,
            bloques: pagina.bloques,
        },
    };
};

export const registrarVisitaService = async (slug, id_usuario_visitante) => {
    const { residente } = await getVisiblePorSlug(slug);

    if (id_usuario_visitante && residente.id_usuario === id_usuario_visitante) return { contada: false };

    await paginaRepository.query(
        `UPDATE paginas_residente
        SET visitas = jsonb_set(
            COALESCE(visitas, '{}'::jsonb),
            ARRAY[$2::text],
            to_jsonb(COALESCE((visitas ->> $2::text)::int, 0) + 1)
        )
        WHERE id_residente = $1`,
        [residente.id_residente, mesActual()]
    );
    return { contada: true };
};