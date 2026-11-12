// Servicio del módulo de habilidades del usuario.
// Contiene las reglas de negocio de las habilidades ofrecidas y requeridas;
// las consultas SQL se delegan al repositorio.

import * as habilidadesUsuarioRepository from './habilidades-usuario.repository.js';
import * as habilidadesRepository from '../habilidades/habilidades.repository.js';
import { mapearOfrecida, mapearRequerida } from './habilidades-usuario.mapper.js';
import { elegirCampo } from '../../utils/campos.js';

// Mensajes reutilizados para que las respuestas sean consistentes.
const MENSAJE_OFRECIDA_NO_ENCONTRADA =
    'La habilidad ofrecida no existe o no pertenece a tu perfil.';
const MENSAJE_REQUERIDA_NO_ENCONTRADA =
    'La habilidad requerida no existe o no pertenece a tu perfil.';
const MENSAJE_OFRECIDA_DUPLICADA =
    'Ya registraste esta habilidad como ofrecida.';
const MENSAJE_REQUERIDA_DUPLICADA =
    'Ya registraste esta habilidad como requerida.';

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Verifica que la habilidad exista en el catálogo y que esté activa.
// Un usuario no puede asociar habilidades inexistentes o retiradas.
async function verificarHabilidad(idHabilidad) {
    const habilidad = await habilidadesRepository.findById(idHabilidad);

    if (!habilidad) {
        throw crearError(404, 'La habilidad indicada no existe.');
    }

    if (habilidad.estado !== 'activo') {
        throw crearError(
            409,
            'La habilidad indicada no está activa en el catálogo.'
        );
    }

    return habilidad;
}

// Lista las habilidades ofrecidas por el usuario autenticado.
export async function listarOfrecidas(idUsuario) {
    const filas =
        await habilidadesUsuarioRepository.findOfrecidasByUsuario(idUsuario);

    return filas.map(mapearOfrecida);
}

// Registra una habilidad ofrecida por el usuario autenticado.
export async function registrarOfrecida(idUsuario, datos) {
    await verificarHabilidad(datos.idHabilidad);

    try {
        const fila = await habilidadesUsuarioRepository.createOfrecida(
            idUsuario,
            datos
        );

        return mapearOfrecida(fila);
    } catch (error) {
        // MySQL devuelve este código cuando se repite la pareja usuario-habilidad.
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(409, MENSAJE_OFRECIDA_DUPLICADA);
        }

        throw error;
    }
}

// Actualiza una habilidad ofrecida del usuario autenticado.
// Solo se modifican los campos enviados en la petición.
export async function actualizarOfrecida(idUsuario, idOfrecida, datos) {
    const actual = await habilidadesUsuarioRepository.findOfrecidaById(
        idOfrecida,
        idUsuario
    );

    if (!actual) {
        throw crearError(404, MENSAJE_OFRECIDA_NO_ENCONTRADA);
    }

    // Si la petición cambia de habilidad, verificamos la nueva.
    if (
        Object.hasOwn(datos, 'idHabilidad') &&
        datos.idHabilidad !== actual.id_habilidad
    ) {
        await verificarHabilidad(datos.idHabilidad);
    }

    const cambios = {
        idHabilidad: elegirCampo(datos, 'idHabilidad', actual.id_habilidad),
        nivel: elegirCampo(datos, 'nivel', actual.nivel),
        descripcionApoyo: elegirCampo(
            datos,
            'descripcionApoyo',
            actual.descripcion_apoyo
        ),
        estado: elegirCampo(datos, 'estado', actual.estado)
    };

    try {
        const fila = await habilidadesUsuarioRepository.updateOfrecida(
            idOfrecida,
            idUsuario,
            cambios
        );

        return mapearOfrecida(fila);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(409, MENSAJE_OFRECIDA_DUPLICADA);
        }

        throw error;
    }
}

// Elimina una habilidad ofrecida del usuario autenticado.
export async function eliminarOfrecida(idUsuario, idOfrecida) {
    const eliminada = await habilidadesUsuarioRepository.removeOfrecida(
        idOfrecida,
        idUsuario
    );

    if (!eliminada) {
        throw crearError(404, MENSAJE_OFRECIDA_NO_ENCONTRADA);
    }
}

// Lista las habilidades requeridas por el usuario autenticado.
export async function listarRequeridas(idUsuario) {
    const filas =
        await habilidadesUsuarioRepository.findRequeridasByUsuario(idUsuario);

    return filas.map(mapearRequerida);
}

// Registra una habilidad que el usuario autenticado desea aprender.
export async function registrarRequerida(idUsuario, datos) {
    await verificarHabilidad(datos.idHabilidad);

    try {
        const fila = await habilidadesUsuarioRepository.createRequerida(
            idUsuario,
            datos
        );

        return mapearRequerida(fila);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(409, MENSAJE_REQUERIDA_DUPLICADA);
        }

        throw error;
    }
}

// Actualiza una habilidad requerida del usuario autenticado.
// Solo se modifican los campos enviados en la petición.
export async function actualizarRequerida(idUsuario, idRequerida, datos) {
    const actual = await habilidadesUsuarioRepository.findRequeridaById(
        idRequerida,
        idUsuario
    );

    if (!actual) {
        throw crearError(404, MENSAJE_REQUERIDA_NO_ENCONTRADA);
    }

    // Si la petición cambia de habilidad, verificamos la nueva.
    if (
        Object.hasOwn(datos, 'idHabilidad') &&
        datos.idHabilidad !== actual.id_habilidad
    ) {
        await verificarHabilidad(datos.idHabilidad);
    }

    const cambios = {
        idHabilidad: elegirCampo(datos, 'idHabilidad', actual.id_habilidad),
        nivelDeseado: elegirCampo(
            datos,
            'nivelDeseado',
            actual.nivel_deseado
        ),
        objetivoAprendizaje: elegirCampo(
            datos,
            'objetivoAprendizaje',
            actual.objetivo_aprendizaje
        ),
        estado: elegirCampo(datos, 'estado', actual.estado)
    };

    try {
        const fila = await habilidadesUsuarioRepository.updateRequerida(
            idRequerida,
            idUsuario,
            cambios
        );

        return mapearRequerida(fila);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(409, MENSAJE_REQUERIDA_DUPLICADA);
        }

        throw error;
    }
}

// Elimina una habilidad requerida del usuario autenticado.
export async function eliminarRequerida(idUsuario, idRequerida) {
    const eliminada = await habilidadesUsuarioRepository.removeRequerida(
        idRequerida,
        idUsuario
    );

    if (!eliminada) {
        throw crearError(404, MENSAJE_REQUERIDA_NO_ENCONTRADA);
    }
}
