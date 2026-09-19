import { AppDataSource } from "../config/configDb.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ILike, In } from "typeorm";

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export const getUsuarioService = async (id_usuario) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });

    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
    return usuario;
};

export const getUsuariosService = async (query) => {
    const { rol, busqueda, page = 1, limit = 6 } = query;

    const qb = usuarioRepository.createQueryBuilder("usuario")
        .select([
            "usuario.id_usuario",
            "usuario.nombre_usuario",
            "usuario.nombre",
            "usuario.apellido",
            "usuario.email",
            "usuario.telefono",
            "usuario.rol",
        ])
        .orderBy("usuario.created_at", "DESC");

    if (rol) {
        qb.andWhere("usuario.rol = :rol", { rol });
    }

    if (busqueda) {
        qb.andWhere(
            "(usuario.nombre ILIKE :busqueda OR usuario.apellido ILIKE :busqueda OR usuario.email ILIKE :busqueda OR usuario.nombre_usuario ILIKE :busqueda)",
            { busqueda: `%${busqueda}%` }
        );
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 6;

    qb.skip((pageNum - 1) * limitNum).take(limitNum);

    const [usuarios, total] = await qb.getManyAndCount();

    return {
        usuarios,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    };
};

export const updateUsuarioService = async (id_usuario, data) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
 
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
 
    delete data.contraseña;
 
    await usuarioRepository.update(id_usuario, data);
    return await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
};

export const cambiarContrasenaService = async (id_usuario, contraseñaActual, contraseñaNueva) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });
 
    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
 
    const coincide = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!coincide) {
        throw { status: 401, message: "La contraseña actual es incorrecta" };
    }
 
    const nuevaEncriptada = await bcrypt.hash(contraseñaNueva, 10);
    await usuarioRepository.update(id_usuario, { contraseña: nuevaEncriptada });
 
    return true;
};

export const deleteUsuarioService = async (id_usuario) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });

    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
    await usuarioRepository.delete(id_usuario);
    return true;
};