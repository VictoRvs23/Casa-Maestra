import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import ServicioResidenteEntity from "../entities/servicioResidente.entity.js";
import HorarioResidenteEntity from "../entities/horarioResidente.entity.js";
import { buscarPorSlug, esVisible } from "./tarjeta.services.js";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const servicioRepository = AppDataSource.getRepository(ServicioResidenteEntity);
const horarioRepository = AppDataSource.getRepository(HorarioResidenteEntity);

export const MAX_SERVICIOS = 30;

const aMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

const borrarImagenLocal = (ruta) => {
    if (!ruta || !ruta.startsWith("/uploads/servicios/")) return;
    const fisica = path.resolve("." + ruta);
    fs.unlink(fisica, (err) => {
        if (err && err.code !== "ENOENT") console.error("No se pudo borrar la imagen del servicio:", fisica, err.message);
    });
};

const getResidenteDeUsuario = async (id_usuario) => {
    const residente = await residenteRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
    if (!residente) throw { status: 404, message: "No tienes una tarjeta de residente." };
    return residente;
};

const normalizarServicio = (data) => {
    const numero = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
    const tipo = data.tipo;
    const duracion = numero(data.duracion_min);

    if (tipo === "servicio" && !duracion) {
        throw { status: 400, message: "Indica cuánto dura el servicio (en minutos)." };
    }

    return {
        tipo,
        nombre: String(data.nombre).trim(),
        descripcion: data.descripcion ? String(data.descripcion).trim() : null,
        precio: numero(data.precio),
        duracion_min: tipo === "servicio" ? duracion : null,
    };
};

const aBooleano = (v) => v === true || v === "true";

export const getMisServiciosService = async (id_usuario) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    return await servicioRepository.find({
        where: { id_residente: residente.id_residente },
        order: { tipo: "ASC", nombre: "ASC" },
    });
};

export const crearServicioService = async (id_usuario, data, archivo) => {
    const residente = await getResidenteDeUsuario(id_usuario);

    const total = await servicioRepository.countBy({ id_residente: residente.id_residente });
    if (total >= MAX_SERVICIOS) {
        if (archivo) borrarImagenLocal(`/uploads/servicios/${archivo.filename}`);
        throw { status: 400, message: `Puedes tener hasta ${MAX_SERVICIOS} servicios y productos.` };
    }

    let campos;
    try {
        campos = normalizarServicio(data);
    } catch (e) {
        if (archivo) borrarImagenLocal(`/uploads/servicios/${archivo.filename}`);
        throw e;
    }

    const nuevo = servicioRepository.create({
        ...campos,
        id_residente: residente.id_residente,
        imagen: archivo ? `/uploads/servicios/${archivo.filename}` : null,
        activo: data.activo === undefined ? true : aBooleano(data.activo),
    });
    return await servicioRepository.save(nuevo);
};

export const actualizarServicioService = async (id_usuario, id_servicio, data, archivo) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const servicio = await servicioRepository.findOneBy({
        id_servicio: parseInt(id_servicio),
        id_residente: residente.id_residente,
    });

    const imagenNueva = archivo ? `/uploads/servicios/${archivo.filename}` : null;

    if (!servicio) {
        if (imagenNueva) borrarImagenLocal(imagenNueva);
        throw { status: 404, message: "Servicio no encontrado." };
    }

    let campos;
    try {
        campos = normalizarServicio(data);
    } catch (e) {
        if (imagenNueva) borrarImagenLocal(imagenNueva);
        throw e;
    }

    const cambios = { ...campos };
    if (data.activo !== undefined) cambios.activo = aBooleano(data.activo);

    if (imagenNueva) {
        cambios.imagen = imagenNueva;
        borrarImagenLocal(servicio.imagen);
    } else if (aBooleano(data.quitar_imagen)) {
        cambios.imagen = null;
        borrarImagenLocal(servicio.imagen);
    }

    await servicioRepository.update(servicio.id_servicio, cambios);
    return await servicioRepository.findOneBy({ id_servicio: servicio.id_servicio });
};

export const eliminarServicioService = async (id_usuario, id_servicio) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const servicio = await servicioRepository.findOneBy({
        id_servicio: parseInt(id_servicio),
        id_residente: residente.id_residente,
    });
    if (!servicio) throw { status: 404, message: "Servicio no encontrado." };

    borrarImagenLocal(servicio.imagen);
    await servicioRepository.delete(servicio.id_servicio);
    return true;
};

export const getMisHorariosService = async (id_usuario) => {
    const residente = await getResidenteDeUsuario(id_usuario);
    const bloques = await horarioRepository.find({
        where: { id_residente: residente.id_residente },
        order: { dia_semana: "ASC", hora_inicio: "ASC" },
    });
    return bloques.map(({ dia_semana, hora_inicio, hora_fin }) => ({ dia_semana, hora_inicio, hora_fin }));
};

export const guardarMisHorariosService = async (id_usuario, bloques) => {
    const residente = await getResidenteDeUsuario(id_usuario);

    for (const b of bloques) {
        if (aMinutos(b.hora_fin) <= aMinutos(b.hora_inicio)) {
            throw { status: 400, message: "En cada bloque, la hora de término debe ser posterior a la de inicio." };
        }
    }

    const ordenados = [...bloques].sort(
        (a, b) => a.dia_semana - b.dia_semana || aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio)
    );
    for (let i = 1; i < ordenados.length; i++) {
        const antes = ordenados[i - 1];
        const ahora = ordenados[i];
        if (antes.dia_semana === ahora.dia_semana && aMinutos(ahora.hora_inicio) < aMinutos(antes.hora_fin)) {
            throw { status: 400, message: "Hay bloques que se cruzan en un mismo día. Revísalos." };
        }
    }

    await AppDataSource.transaction(async (manager) => {
        const repo = manager.getRepository(HorarioResidenteEntity);
        await repo.delete({ id_residente: residente.id_residente });
        if (ordenados.length > 0) {
            await repo.save(ordenados.map((b) => repo.create({ ...b, id_residente: residente.id_residente })));
        }
    });

    return await getMisHorariosService(id_usuario);
};

export const getOfertaPublicaService = async (slug) => {
    const residente = await buscarPorSlug(slug);
    if (!residente || !(await esVisible(residente))) {
        throw { status: 404, message: "Esta página no está disponible." };
    }

    const servicios = await servicioRepository.find({
        where: { id_residente: residente.id_residente, activo: true },
        order: { tipo: "ASC", nombre: "ASC" },
    });
    const tieneHorarios = (await horarioRepository.countBy({ id_residente: residente.id_residente })) > 0;

    return {
        residente: { nombre: residente.nombre, slug: residente.slug },
        servicios,
        agenda_abierta: tieneHorarios && servicios.length > 0,
    };
};
