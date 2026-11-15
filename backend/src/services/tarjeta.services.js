import { AppDataSource } from "../config/configDb.js";
import ResidenteEntity from "../entities/residente.entity.js";
import PaginaResidenteEntity from "../entities/paginaResidente.entity.js";
import { slugify } from "../helpers/slug.helper.js";
import { notificarTarjetaCreada } from "./notificacion.eventos.js";

const residenteRepository = AppDataSource.getRepository(ResidenteEntity);
const paginaRepository = AppDataSource.getRepository(PaginaResidenteEntity);

const MAX_ENLACES_ANTERIORES = 5;

export const buscarPorSlug = async (slug) => {
    const actual = await residenteRepository.findOneBy({ slug });
    if (actual) return actual;

    return residenteRepository
        .createQueryBuilder("r")
        .where("r.slugs_anteriores @> CAST(:slug AS jsonb)", { slug: JSON.stringify([slug]) })
        .getOne();
};

export const esVisible = async (residente) => {
    if (!residente?.activa) return false;
    const pagina = await paginaRepository.findOneBy({ id_residente: residente.id_residente });
    return Boolean(pagina?.publicada);
};

export const nombreDisponible = async (nombre, id_excluir = null) => {
    const qb = residenteRepository
        .createQueryBuilder("r")
        .where("(LOWER(r.nombre) = LOWER(:nombre) OR r.slug = :slug)", { nombre, slug: slugify(nombre) });

    if (id_excluir) qb.andWhere("r.id_residente != :id", { id: id_excluir });

    return (await qb.getCount()) === 0;
};

export const cambiosPorNombre = async (residente, nombreNuevo) => {
    const nombre = String(nombreNuevo).trim();
    if (nombre === residente.nombre) return {};

    if (!(await nombreDisponible(nombre, residente.id_residente))) {
        throw { status: 409, message: "Ese nombre artístico ya está en uso. Elige otro." };
    }

    const cambios = { nombre };
    const slug = slugify(nombre);

    if (slug !== residente.slug) {
        const anteriores = (residente.slugs_anteriores || []).filter((s) => s !== slug);
        cambios.slug = slug;
        cambios.slugs_anteriores = [...new Set([...anteriores, residente.slug])].slice(-MAX_ENLACES_ANTERIORES);
    }
    return cambios;
};

const nombreUnicoDesde = async (base) => {
    let nombre = base.slice(0, 80);
    let n = 2;
    while (!(await nombreDisponible(nombre))) {
        const sufijo = ` ${n}`;
        nombre = `${base.slice(0, 80 - sufijo.length)}${sufijo}`;
        n++;
    }
    return nombre;
};

export const asegurarTarjetaDeUsuario = async (usuario) => {
    const existente = await residenteRepository.findOneBy({ id_usuario: usuario.id_usuario });

    if (existente) {
        if (!existente.activa) await residenteRepository.update(existente.id_residente, { activa: true });
        return { residente: { ...existente, activa: true }, creada: false };
    }

    try {
        const nombre = await nombreUnicoDesde(`${usuario.nombre} ${usuario.apellido}`.trim() || usuario.nombre_usuario);

        const residente = await residenteRepository.save(
            residenteRepository.create({
                nombre,
                slug: slugify(nombre),
                id_usuario: usuario.id_usuario,
                activa: true,
            })
        );

        await paginaRepository.save(paginaRepository.create({ id_residente: residente.id_residente, bloques: [] }));
        await notificarTarjetaCreada(usuario.id_usuario);

        return { residente, creada: true };
    } catch (error) {
        if (error.code === "23505") {
            const creada = await residenteRepository.findOneBy({ id_usuario: usuario.id_usuario });
            if (creada) return { residente: creada, creada: false };
        }
        throw error;
    }
};

export const ocultarTarjetaDeUsuario = async (id_usuario) => {
    await residenteRepository.update({ id_usuario: parseInt(id_usuario) }, { activa: false });
};

export const sincronizarTarjetaConRol = async (usuario, rolAnterior) => {
    if (usuario.rol === rolAnterior) return;

    if (usuario.rol === "Residente") await asegurarTarjetaDeUsuario(usuario);
    else if (rolAnterior === "Residente") await ocultarTarjetaDeUsuario(usuario.id_usuario);
};
