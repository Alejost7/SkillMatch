// Servicio del módulo de usuarios.

import * as usuariosRepository from './usuarios.repository.js';
import * as habilidadesUsuarioRepository from '../habilidades-usuario/habilidades-usuario.repository.js';
import * as calificacionesService from '../calificaciones/calificaciones.service.js';
import {
    agruparPorUsuario,
    habilidadesVacias,
    mapearOfrecida,
    mapearRequerida
} from '../habilidades-usuario/habilidades-usuario.mapper.js';
import { construirPaginacion } from '../../utils/consulta.js';
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

// Resumen de calificaciones que acompaña al perfil de un usuario.
async function obtenerResumenCalificaciones(idUsuario) {
    const { promedio, total } = await calificacionesService.obtenerResumen(
        idUsuario
    );

    return { promedio, total };
}

// Consulta el perfil del usuario autenticado.
export async function obtenerPerfil(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    return {
        ...mapearUsuario(usuario),
        calificacion: await obtenerResumenCalificaciones(idUsuario)
    };
}

// Consulta un usuario por identificador.
// Devuelve solo información pública e incluye sus habilidades registradas.
export async function obtenerUsuario(idUsuario) {
    const usuario = await usuariosRepository.findById(idUsuario);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    const [ofrecidas, requeridas, calificacion] = await Promise.all([
        habilidadesUsuarioRepository.findOfrecidasByUsuario(idUsuario),
        habilidadesUsuarioRepository.findRequeridasByUsuario(idUsuario),
        obtenerResumenCalificaciones(idUsuario)
    ]);

    return {
        ...mapearUsuarioPublico(usuario),
        calificacion,
        habilidades: {
            ofrecidas: ofrecidas.map(mapearOfrecida),
            requeridas: requeridas.map(mapearRequerida)
        }
    };
}

// Busca usuarios por nombre, ubicación o habilidades, con paginación.
// Solo se listan cuentas activas y sin datos sensibles.
export async function buscarUsuarios({
    filtros,
    pagina,
    limite,
    desplazamiento
}) {
    const total = await usuariosRepository.contarUsuarios(filtros);

    const paginacion = construirPaginacion({ total, pagina, limite });

    // Si no hay resultados evitamos las consultas del listado.
    if (total === 0) {
        return { usuarios: [], paginacion };
    }

    const filas = await usuariosRepository.buscarUsuarios(filtros, {
        limite,
        desplazamiento
    });

    // Las habilidades de toda la página se resuelven con dos consultas.
    const ids = filas.map((fila) => fila.id_usuario);

    const [ofrecidas, requeridas] = await Promise.all([
        habilidadesUsuarioRepository.findOfrecidasByUsuarios(ids),
        habilidadesUsuarioRepository.findRequeridasByUsuarios(ids)
    ]);

    const habilidades = agruparPorUsuario(ofrecidas, requeridas);

    const usuarios = filas.map((fila) => ({
        ...mapearUsuarioPublico(fila),
        habilidades: habilidades.get(fila.id_usuario) ?? habilidadesVacias()
    }));

    return { usuarios, paginacion };
}

// Quita los datos que no deben exponerse en las consultas públicas.
function mapearUsuarioPublico(usuario) {
    const { correoElectronico, estadoCuenta, ultimoAcceso, ...publico } =
        mapearUsuario(usuario);

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