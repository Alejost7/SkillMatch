// Servicio del módulo de usuarios.

import * as usuariosRepository from './usuarios.repository.js';
import { elegirCampo } from '../../utils/campos.js';

// Crea un error con código HTTP.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Convierte la fila de la base de datos a un objeto uniforme en camelCase.
// Así todos los endpoints del módulo responden con el mismo formato.
function mapearUsuario(usuario) {
    return {
        idUsuario: usuario.id_usuario,
        idRol: usuario.id_rol,
        rol: usuario.rol,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        alias: usuario.alias,
        correoElectronico: usuario.correo_electronico,
        estadoCuenta: usuario.estado_cuenta,
        fechaRegistro: usuario.fecha_registro,
        ultimoAcceso: usuario.ultimo_acceso,
        perfil: {
            biografia: usuario.biografia,
            fotoPerfilUrl: usuario.foto_perfil_url,
            disponibilidad: usuario.disponibilidad,
            ciudad: usuario.ciudad,
            pais: usuario.pais
        }
    };
}

// Consulta el perfil del usuario autenticado.
export async function obtenerPerfil(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    return mapearUsuario(usuario);
}

// Consulta un usuario por identificador.
export async function obtenerUsuario(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    const { correoElectronico, estadoCuenta, ultimoAcceso, ...publico } =
        mapearUsuario(usuario);

    // No exponemos el correo ni datos sensibles en consultas públicas.
    return publico;
}

// Actualiza el perfil del usuario autenticado.
// datosBasicos va a la tabla usuario y datosPerfil a la tabla perfil.
export async function actualizarPerfil(idUsuario, datosBasicos, datosPerfil = {}) {
    const actual = await usuariosRepository.findById(idUsuario);

    if (!actual) {
        throw crearError(404, 'El usuario no existe.');
    }

    // Si se envió alias, verificamos que no pertenezca a otro usuario.
    if (datosBasicos.alias) {
        const usuarioConAlias = await usuariosRepository.findByAlias(
            datosBasicos.alias
        );

        if (usuarioConAlias && usuarioConAlias.id_usuario !== idUsuario) {
            throw crearError(409, 'El alias ya está en uso.');
        }
    }

    await usuariosRepository.updatePerfil(idUsuario, datosBasicos);

    // La tabla perfil solo se toca cuando el cliente envió campos extendidos.
    if (Object.keys(datosPerfil).length === 0) {
        return mapearUsuario(await usuariosRepository.findById(idUsuario));
    }

    // Combinamos lo enviado con lo que ya estaba guardado para no borrar
    // información que esta petición no mencionó.
    const perfilCompleto = {
        biografia: elegirCampo(datosPerfil, 'biografia', actual.biografia),
        fotoPerfilUrl: elegirCampo(
            datosPerfil,
            'fotoPerfilUrl',
            actual.foto_perfil_url
        ),
        disponibilidad: elegirCampo(
            datosPerfil,
            'disponibilidad',
            actual.disponibilidad
        ),
        ciudad: elegirCampo(datosPerfil, 'ciudad', actual.ciudad),
        pais: elegirCampo(datosPerfil, 'pais', actual.pais)
    };

    const usuario = await usuariosRepository.upsertPerfil(
        idUsuario,
        perfilCompleto
    );

    return mapearUsuario(usuario);
}