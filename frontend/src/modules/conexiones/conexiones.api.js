import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Conexiones del usuario autenticado.
 * Cada conexión incluye "interlocutor" y "noLeidos".
 */
export async function listarConexiones(filtros = {}, { signal } = {}) {
    const resultado = await apiClient(`/conexiones${crearConsulta(filtros)}`, {
        signal
    });

    return {
        conexiones: resultado.data,
        paginacion: resultado.paginacion
    };
}

export async function obtenerConexion(idConexion, { signal } = {}) {
    const resultado = await apiClient(`/conexiones/${idConexion}`, { signal });

    return resultado.data;
}

/**
 * Finaliza una conexión activa. Cualquiera de los participantes puede hacerlo.
 */
export async function finalizarConexion(idConexion) {
    const resultado = await apiClient(`/conexiones/${idConexion}/finalizar`, {
        method: 'PATCH'
    });

    return resultado.data;
}
