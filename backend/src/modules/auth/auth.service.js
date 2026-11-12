// Servicio de autenticación.
// Contiene la lógica de registro, login y generación del token JWT.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { NOMBRE_ROL_USUARIO } from '../../config/roles.js';
import * as usuariosRepository from '../usuarios/usuarios.repository.js';

// Número de rondas de cifrado de bcrypt.
const RONDAS_BCRYPT = 10;

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Resuelve el identificador del rol "usuario" consultando la base de datos.
// De este modo no dependemos del orden autoincremental de la tabla rol.
async function resolverIdRolUsuario() {
    const idRol = await usuariosRepository.findRolIdByNombre(
        NOMBRE_ROL_USUARIO
    );

    if (!idRol) {
        throw crearError(
            500,
            'No se encontró el rol "usuario" en la base de datos. Ejecuta database/seed.sql para cargar los datos iniciales.'
        );
    }

    return idRol;
}

/**
 * Registra un nuevo usuario.
 */
export async function registrarUsuario(datos) {
    // Verificamos si el correo ya está registrado.
    const correoExistente = await usuariosRepository.findByCorreo(
        datos.correoElectronico
    );

    if (correoExistente) {
        throw crearError(409, 'El correo electrónico ya está registrado.');
    }

    // Si se envió alias, verificamos que no esté repetido.
    if (datos.alias) {
        const aliasExistente = await usuariosRepository.findByAlias(datos.alias);

        if (aliasExistente) {
            throw crearError(409, 'El alias ya está en uso.');
        }
    }

    // Ciframos la contraseña. Nunca se guarda en texto plano.
    const contrasenaHash = await bcrypt.hash(datos.contrasena, RONDAS_BCRYPT);

    // El rol se obtiene por nombre, no por un id escrito en el código.
    const idRol = await resolverIdRolUsuario();

    try {
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
            idRol: usuario.id_rol,
            rol: usuario.rol
        };
    } catch (error) {
        // Dos peticiones simultáneas podrían pasar las validaciones previas.
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(
                409,
                'El correo electrónico o el alias ya están registrados.'
            );
        }

        throw error;
    }
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
        throw crearError(401, 'Credenciales inválidas.');
    }

    // Comparamos la contraseña enviada con el hash almacenado.
    const contrasenaValida = await bcrypt.compare(
        credenciales.contrasena,
        usuario.contrasena_hash
    );

    if (!contrasenaValida) {
        throw crearError(401, 'Credenciales inválidas.');
    }

    // Verificamos que la cuenta esté activa.
    if (usuario.estado_cuenta !== 'activo') {
        throw crearError(403, 'La cuenta no está activa.');
    }

    // Registramos la fecha del último acceso.
    await usuariosRepository.registrarUltimoAcceso(usuario.id_usuario);

    // Creamos el contenido del token.
    // Incluimos el nombre del rol además del id para que las autorizaciones no
    // dependan del orden autoincremental de la tabla rol.
    const payload = {
        idUsuario: usuario.id_usuario,
        idRol: usuario.id_rol,
        rol: usuario.rol,
        correoElectronico: usuario.correo_electronico
    };

    // Firmamos el token JWT con la configuración central.
    const token = jwt.sign(payload, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
        algorithm: 'HS256'
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
            idRol: usuario.id_rol,
            rol: usuario.rol
        }
    };
}
