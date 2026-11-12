import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Lista los mensajes visibles para el usuario.
 * Parámetros: conexionId, desde, page, limit.
 * Con "desde" el backend devuelve solo los mensajes nuevos, sin paginación.
 */
export async function listarMensajes(filtros = {}, { signal } = {}) {
    const resultado = await apiClient(`/mensajes${crearConsulta(filtros)}`, {
        signal
    });

    return {
        mensajes: resultado.data,
        paginacion: resultado.paginacion ?? null
    };
}

/**
 * Envía un mensaje a una conexión activa.
 */
export async function enviarMensaje(datos) {
    const resultado = await apiClient('/mensajes', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

/**
 * Marca como leídos los mensajes recibidos en una conexión.
 */
export async function marcarLeidos(idConexion) {
    const resultado = await apiClient('/mensajes/leidos', {
        method: 'PATCH',
        body: JSON.stringify({ idConexion })
    });

    return resultado.data;
}

/**
 * Resumen de mensajes sin leer agrupados por conexión.
 */
export async function obtenerResumenNoLeidos({ signal } = {}) {
    const resultado = await apiClient('/mensajes/no-leidos', { signal });

    return resultado.data;
}
