import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Califica a la otra persona de una conexión finalizada.
 * El calificado se deduce de la conexión en el backend.
 */
export async function crearCalificacion(datos) {
    const resultado = await apiClient('/calificaciones', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

/**
 * Calificaciones recibidas por un usuario, con su resumen y paginación.
 */
export async function listarCalificacionesUsuario(
    idUsuario,
    filtros = {},
    { signal } = {}
) {
    const resultado = await apiClient(
        `/calificaciones/usuario/${idUsuario}${crearConsulta(filtros)}`,
        { signal }
    );

    return {
        calificaciones: resultado.data,
        resumen: resultado.resumen,
        paginacion: resultado.paginacion
    };
}

/**
 * Calificaciones de una conexión e indicación de si el usuario aún puede
 * calificar el intercambio.
 */
export async function listarCalificacionesConexion(
    idConexion,
    { signal } = {}
) {
    const resultado = await apiClient(
        `/calificaciones/conexion/${idConexion}`,
        { signal }
    );

    return {
        calificaciones: resultado.data,
        puedeCalificar: resultado.puedeCalificar
    };
}
