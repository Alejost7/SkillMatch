import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Perfil del usuario autenticado (incluye correo y resumen de calificaciones).
 */
export async function obtenerPerfil({ signal } = {}) {
    const resultado = await apiClient('/usuarios/perfil', { signal });

    return resultado.data;
}

/**
 * Actualiza el perfil. El backend exige nombres y apellidos; el resto de
 * campos es opcional y, si no se envía, conserva el valor anterior.
 */
export async function actualizarPerfil(datos) {
    const resultado = await apiClient('/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify(datos)
    });

    return { usuario: resultado.data, message: resultado.message };
}

/**
 * Busca usuarios activos por nombre, ubicación o habilidad.
 */
export async function listarUsuarios(filtros = {}, { signal } = {}) {
    const resultado = await apiClient(`/usuarios${crearConsulta(filtros)}`, {
        signal
    });

    return {
        usuarios: resultado.data,
        paginacion: resultado.paginacion
    };
}

/**
 * Información pública de un usuario, con sus habilidades y calificación.
 */
export async function obtenerUsuario(idUsuario, { signal } = {}) {
    const resultado = await apiClient(`/usuarios/${idUsuario}`, { signal });

    return resultado.data;
}
