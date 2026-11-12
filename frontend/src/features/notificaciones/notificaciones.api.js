import { apiClient } from '../../services/apiClient.js';

/**
 * Resumen de notificaciones del usuario autenticado.
 * Devuelve { actualizadoEn, total, solicitudesPendientes, mensajesNoLeidos,
 * pendientesDeCalificar }; el backend lo deriva de datos existentes.
 */
export async function obtenerFeed({ signal } = {}) {
    const resultado = await apiClient('/eventos/feed', { signal });

    return resultado.data;
}
