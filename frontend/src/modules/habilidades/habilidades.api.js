import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Lista el catálogo de habilidades con filtros y paginación.
 * Parámetros admitidos: categoriaId, nombre, estado, orden, page, limit.
 */
export async function listarHabilidades(filtros = {}, { signal } = {}) {
    const resultado = await apiClient(
        `/habilidades${crearConsulta(filtros)}`,
        { signal }
    );

    return {
        habilidades: resultado.data,
        paginacion: resultado.paginacion
    };
}

export async function obtenerHabilidad(idHabilidad, { signal } = {}) {
    const resultado = await apiClient(`/habilidades/${idHabilidad}`, { signal });

    return resultado.data;
}

export async function crearHabilidad(datos) {
    const resultado = await apiClient('/habilidades', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

export async function actualizarHabilidad(idHabilidad, datos) {
    const resultado = await apiClient(`/habilidades/${idHabilidad}`, {
        method: 'PUT',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

export async function eliminarHabilidad(idHabilidad) {
    const resultado = await apiClient(`/habilidades/${idHabilidad}`, {
        method: 'DELETE'
    });

    return resultado;
}
