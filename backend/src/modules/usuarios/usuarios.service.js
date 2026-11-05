// Servicio del módulo de usuarios.

import * as usuariosRepository from './usuarios.repository.js';

// Crea un error con código HTTP.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
    }

    // Consulta el perfil del usuario autenticado.
    export async function obtenerPerfil(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    return usuario;
}

// Consulta un usuario por identificador.
export async function obtenerUsuario(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    // No exponemos el correo ni datos sensibles en consultas públicas.
    return {
        idUsuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        alias: usuario.alias,
        rol: usuario.rol,
        biografia: usuario.biografia,
        fotoPerfilUrl: usuario.foto_perfil_url,
        disponibilidad: usuario.disponibilidad,
        ciudad: usuario.ciudad,
        pais: usuario.pais
    };
}

// Actualiza el perfil del usuario autenticado.
export async function actualizarPerfil(idUsuario, datos) {
    // Si se envió alias, verificamos que no pertenezca a otro usuario.
    if (datos.alias) {
        const usuarioConAlias = await usuariosRepository.findByAlias(datos.alias);

        if (usuarioConAlias && usuarioConAlias.id_usuario !== idUsuario) {
        throw crearError(409, 'El alias ya está en uso.');
        }
    }

    const usuario = await usuariosRepository.updatePerfil(idUsuario, datos);

    return {
        idUsuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        alias: usuario.alias,
        correoElectronico: usuario.correo_electronico,
        idRol: usuario.id_rol
    };
}