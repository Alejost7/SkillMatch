// Servicio de autenticación.
// Contiene la lógica de registro, login y generación del token JWT.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import * as usuariosRepository from '../usuarios/usuarios.repository.js';

// Número de rondas de cifrado de bcrypt.
const RONDAS_BCRYPT = 10;

/**
 * Registra un nuevo usuario.
 */
export async function registrarUsuario(datos) {
    // Verificamos si el correo ya está registrado.
    const correoExistente = await usuariosRepository.findByCorreo(
        datos.correoElectronico
    );

    if (correoExistente) {
        const error = new Error('El correo electrónico ya está registrado.');
        error.status = 409;
        throw error;
    }

    // Si se envió alias, verificamos que no esté repetido.
    if (datos.alias) {
        const aliasExistente = await usuariosRepository.findByAlias(datos.alias);

        if (aliasExistente) {
        const error = new Error('El alias ya está en uso.');
        error.status = 409;
        throw error;
        }
    }

    // Ciframos la contraseña. Nunca se guarda en texto plano.
    const contrasenaHash = await bcrypt.hash(datos.contrasena, RONDAS_BCRYPT);

    // El rol 2 corresponde a "usuario registrado".
    const idRol = 2;

    // Creamos el usuario en la base de datos.
    const usuario = await usuariosRepository.create({
        idRol,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correoElectronico: datos.correoElectronico,
        contrasenaHash,
        alias: datos.alias
    });

  // Devolvemos el usuario sin exponer el hash de la contraseña.
    return {
        idUsuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correoElectronico: usuario.correo_electronico,
        alias: usuario.alias,
        idRol: usuario.id_rol
    };
}

/**
 * Inicia sesión y genera un token JWT.
 */
export async function iniciarSesion(credenciales) {
    // Buscamos el usuario por correo.
    const usuario = await usuariosRepository.findByCorreo(
        credenciales.correoElectronico
    );

    // Si no existe, respondemos con un error genérico.
    // No decimos si falló el correo o la contraseña para evitar dar pistas.
    if (!usuario) {
        const error = new Error('Credenciales inválidas.');
        error.status = 401;
        throw error;
    }

    // Comparamos la contraseña enviada con el hash almacenado.
    const contrasenaValida = await bcrypt.compare(
        credenciales.contrasena,
        usuario.contrasena_hash
    );

    if (!contrasenaValida) {
        const error = new Error('Credenciales inválidas.');
        error.status = 401;
        throw error;
    }

    // Verificamos que la cuenta esté activa.
    if (usuario.estado_cuenta !== 'activo') {
        const error = new Error('La cuenta no está activa.');
        error.status = 403;
        throw error;
    }

    // Creamos el contenido del token.
    const payload = {
        idUsuario: usuario.id_usuario,
        idRol: usuario.id_rol,
        correoElectronico: usuario.correo_electronico
    };

    // Firmamos el token JWT.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    // Devolvemos el token y datos básicos del usuario.
    return {
        token,
        usuario: {
        idUsuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correoElectronico: usuario.correo_electronico,
        alias: usuario.alias,
        idRol: usuario.id_rol
        }
    };
}