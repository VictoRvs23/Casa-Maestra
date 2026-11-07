import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import PaginaResidenteEntity from "../entities/paginaResidente.entity.js";
import ResidenteEntity from "../entities/residente.entity.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import { PREFIJO_URL_PAGINA } from "../config/paginaEstilos.js";

const paginaRepository = AppDataSource.getRepository(PaginaResidenteEntity);
const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

const borrarImagenLocal = (rutaImagen) => {
    if (!rutaImagen || !rutaImagen.startsWith(PREFIJO_URL_PAGINA)) return;

    const rutaFisica = path.resolve("." + rutaImagen);
    fs.unlink(rutaFisica, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("No se pudo borrar la imagen huérfana:", rutaFisica, err.message);
        }
    });
};

const urlsDePagina = ({ portada, bloques }) => {
    const urls = [];
    if (portada) urls.push(portada);

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

    if (!residente) {
        throw {
            status: 404,
            message: "Tu cuenta aún no está asociada a una tarjeta de residente. Pídele al Fundador/a que la vincule.",
        };
    }
    return residente;
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

export const getMiPaginaService = async (id_usuario) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const pagina = await getOCrearPagina(residente);

    const usuario = await usuarioRepository.findOne({
        where: { id_usuario },
        select: { id_usuario: true, nombre: true, apellido: true, nombre_usuario: true, avatar: true },
    });

    return {
        pagina,
        residente: {
            id_residente: residente.id_residente,
            nombre: residente.nombre,
            descripcion: residente.descripcion,
            slug: residente.slug,
        },
        usuario,
    };
};

export const updateMiPaginaService = async (id_usuario, data) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const pagina = await getOCrearPagina(residente);

    const resultado = { ...pagina, ...data };
    const despues = urlsDePagina(resultado);

    const prefijoPropio = `${PREFIJO_URL_PAGINA}pagina-${id_usuario}-`;
    if (despues.some((url) => !url.startsWith(prefijoPropio))) {
        throw { status: 400, message: "Una de las imágenes no pertenece a tu cuenta." };
    }

    const antes = urlsDePagina(pagina);

    Object.assign(pagina, data);
    const guardada = await paginaRepository.save(pagina);

    antes.filter((url) => !despues.includes(url)).forEach(borrarImagenLocal);

    return guardada;
};

export const limpiarImagenesDeResidenteService = async (id_residente) => {
    const pagina = await paginaRepository.findOneBy({ id_residente: parseInt(id_residente) });
    if (!pagina) return;
    urlsDePagina(pagina).forEach(borrarImagenLocal);
};

export const getPaginaPublicaService = async (slug) => {
    const residente = await residenteRepository.findOne({
        where: { slug },
        relations: { usuario: true },
    });

    if (!residente) throw { status: 404, message: "No encontramos a este residente." };

    const pagina = await paginaRepository.findOneBy({ id_residente: residente.id_residente });

    if (!pagina || !pagina.publicada) {
        throw { status: 404, message: "Esta página aún no está disponible." };
    }

    return {
        residente: {
            nombre: residente.nombre,
            descripcion: residente.descripcion,
            slug: residente.slug,
        },
        avatar: residente.usuario?.avatar || null,
        pagina: {
            color_acento: pagina.color_acento,
            color_fondo: pagina.color_fondo,
            fuente: pagina.fuente,
            portada: pagina.portada,
            bloques: pagina.bloques,
        },
    };
};
