// Servicio del módulo de calificaciones.
// Solo se puede calificar a la otra persona de una conexión finalizada, una
// sola vez, y el calificado siempre se deduce de la conexión.

import * as calificacionesRepository from './calificaciones.repository.js';
import * as conexionesRepository from '../conexiones/conexiones.repository.js';
import * as usuariosRepository from '../usuarios/usuarios.repository.js';
import { mapearCalificacionParaUsuario } from './calificaciones.mapper.js';
import { construirPaginacion } from '../../utils/consulta.js';

// Mensaje único para conexiones inexistentes o ajenas: no se revela si el
// registro existe cuando el usuario no participa en él.
const MENSAJE_CONEXION_NO_ENCONTRADA =
    'La conexión no existe o no participas en ella.';
const MENSAJE_INTERCAMBIO_NO_FINALIZADO =
    'Solo puedes calificar un intercambio finalizado.';
const MENSAJE_YA_CALIFICADO = 'Ya calificaste este intercambio.';

// Puntuaciones posibles, usadas para la distribución del resumen.
const PUNTUACIONES = [1, 2, 3, 4, 5];

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Indica si el usuario participa en la conexión.
function esParticipante(fila, idUsuario) {
    return (
        fila.id_usuario_emisor === idUsuario ||
        fila.id_usuario_receptor === idUsuario
    );
}

// Busca la conexión comprobando que el usuario participe en ella.
async function buscarConexion(idUsuario, idConexion) {
    const fila = await conexionesRepository.findById(idConexion);

    if (!fila || !esParticipante(fila, idUsuario)) {
        throw crearError(404, MENSAJE_CONEXION_NO_ENCONTRADA);
    }

    return fila;
}

// Devuelve el identificador de la otra persona de la conexión.
function obtenerInterlocutor(conexion, idUsuario) {
    return conexion.id_usuario_emisor === idUsuario
        ? conexion.id_usuario_receptor
        : conexion.id_usuario_emisor;
}

// Calcula total, promedio y distribución a partir de las filas agrupadas.
export function calcularResumen(filas) {
    const distribucion = Object.fromEntries(
        PUNTUACIONES.map((puntuacion) => [puntuacion, 0])
    );

    let total = 0;
    let suma = 0;

    for (const fila of filas) {
        const cantidad = Number(fila.total);

        distribucion[fila.puntuacion] = cantidad;
        total += cantidad;
        suma += Number(fila.puntuacion) * cantidad;
    }

    return {
        total,
        // Dos decimales son suficientes para mostrar el promedio.
        promedio: total === 0 ? 0 : Number((suma / total).toFixed(2)),
        distribucion
    };
}

// Resumen de las calificaciones recibidas por un usuario.
export async function obtenerResumen(idUsuarioCalificado) {
    const filas = await calificacionesRepository.resumenPorUsuario(
        idUsuarioCalificado
    );

    return calcularResumen(filas);
}

// Registra la calificación de un intercambio finalizado.
export async function crearCalificacion(
    idUsuario,
    { idConexion, puntuacion, comentario }
) {
    const conexion = await buscarConexion(idUsuario, idConexion);

    if (conexion.estado_conexion !== 'finalizada') {
        throw crearError(409, MENSAJE_INTERCAMBIO_NO_FINALIZADO);
    }

    const idCalificado = obtenerInterlocutor(conexion, idUsuario);

    const existente = await calificacionesRepository.findEntreConexion(
        idConexion,
        idUsuario,
        idCalificado
    );

    if (existente) {
        throw crearError(409, MENSAJE_YA_CALIFICADO);
    }

    try {
        const fila = await calificacionesRepository.create({
            idConexion,
            idCalificador: idUsuario,
            idCalificado,
            puntuacion,
            comentario
        });

        return mapearCalificacionParaUsuario(fila, idUsuario);
    } catch (error) {
        // La clave única protege ante dos envíos simultáneos.
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(409, MENSAJE_YA_CALIFICADO);
        }

        throw error;
    }
}

// Lista las calificaciones que recibió un usuario, con su resumen.
export async function listarRecibidas(
    idUsuario,
    idUsuarioCalificado,
    { pagina, limite, desplazamiento }
) {
    const usuario = await usuariosRepository.findById(idUsuarioCalificado);

    if (!usuario) {
        throw crearError(404, 'El usuario no existe.');
    }

    const total = await calificacionesRepository.contarRecibidas(
        idUsuarioCalificado
    );

    const paginacion = construirPaginacion({ total, pagina, limite });
    const resumen = await obtenerResumen(idUsuarioCalificado);

    // Si no hay resultados evitamos la consulta del listado.
    if (total === 0) {
        return { calificaciones: [], resumen, paginacion };
    }

    const filas = await calificacionesRepository.buscarRecibidas({
        idCalificado: idUsuarioCalificado,
        limite,
        desplazamiento
    });

    const calificaciones = filas.map((fila) =>
        mapearCalificacionParaUsuario(fila, idUsuario)
    );

    return { calificaciones, resumen, paginacion };
}

// Lista las calificaciones de una conexión e indica si aún se puede calificar.
export async function listarPorConexion(idUsuario, idConexion) {
    const conexion = await buscarConexion(idUsuario, idConexion);

    const filas = await calificacionesRepository.buscarPorConexion(idConexion);

    // El usuario puede calificar si el intercambio terminó y aún no lo hizo.
    const puedeCalificar =
        conexion.estado_conexion === 'finalizada' &&
        !filas.some((fila) => fila.id_calificador === idUsuario);

    return {
        calificaciones: filas.map((fila) =>
            mapearCalificacionParaUsuario(fila, idUsuario)
        ),
        puedeCalificar
    };
}
