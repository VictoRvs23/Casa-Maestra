import { AppDataSource } from "../config/configDb.js";
import UsuarioEntity from "../entities/usuario.entity.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/configEnv.js";

const usuarioRepository = AppDataSource.getRepository(UsuarioEntity);

export const loginService = async ({ email, contraseña }) => {
    const usuario = await usuarioRepository.findOneBy({ email });
    if (!usuario) {
        throw { status: 404, message: "Usuario no encontrado" };
    }

    const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!isMatch) {
        throw { status: 401, message: "Contraseña incorrecta" };
    }

    const token = jwt.sign(
        { id_usuario: usuario.id_usuario, nombre_usuario: usuario.nombre_usuario, nombre: usuario.nombre,
            apellido: usuario.apellido, email: usuario.email, telefono: usuario.telefono, rol: usuario.rol },
        JWT_SECRET,
        { expiresIn: "1d" } 
    );

    return { 
        token, 
        usuario: { 
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario, 
            nombre: usuario.nombre, 
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            rol: usuario.rol
        } 
    };
};

export const registroService = async ({ nombre_usuario, nombre, apellido, email, contraseña, telefono }) => {
    const usuarioExistente = await usuarioRepository.findOneBy({ email });
    if (usuarioExistente) {
        throw { status: 409, message: "El correo ya está registrado" };
    }

    const nombreUsuarioExistente = await usuarioRepository.findOneBy({ nombre_usuario });
    if (nombreUsuarioExistente) {
        throw { status: 409, message: "El nombre de usuario ya está en uso" };
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = usuarioRepository.create({
        nombre_usuario,
        nombre,
        apellido,
        email,
        telefono,
        contraseña: contraseñaEncriptada,
        rol: "Cliente",
    });

    const usuarioGuardado = await usuarioRepository.save(nuevoUsuario);

    const token = jwt.sign(
        {
            id_usuario: usuarioGuardado.id_usuario,
            nombre_usuario: usuarioGuardado.nombre_usuario,
            nombre: usuarioGuardado.nombre,
            apellido: usuarioGuardado.apellido,
            email: usuarioGuardado.email,
            telefono: usuarioGuardado.telefono,
            rol: usuarioGuardado.rol,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        usuario: {
            id_usuario: usuarioGuardado.id_usuario,
            nombre_usuario: usuarioGuardado.nombre_usuario,
            nombre: usuarioGuardado.nombre,
            apellido: usuarioGuardado.apellido,
            email: usuarioGuardado.email,
            telefono: usuarioGuardado.telefono,
            rol: usuarioGuardado.rol,
        },
    };
};