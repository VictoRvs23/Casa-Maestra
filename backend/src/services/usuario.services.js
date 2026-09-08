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
    
    if(data.contraseña) {
        data.contraseña = await bcrypt.hash(data.contraseña, 10);
    }
    
    await usuarioRepository.update(id_usuario, data);
    return true;
};

export const deleteUsuarioService = async (id_usuario) => {
    const usuario = await usuarioRepository.findOneBy({ id_usuario: parseInt(id_usuario) });

    if (!usuario) throw { status: 404, message: "Usuario no encontrado" };
    await usuarioRepository.delete(id_usuario);
    return true;
};