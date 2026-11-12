// Lectura uniforme de los errores que lanza apiClient.
// Todas las páginas muestran mensajes en español, así que aquí se concentra la
// decisión de qué texto usar.

const MENSAJE_POR_DEFECTO = 'No fue posible completar la operación.';

/**
 * Devuelve un texto legible para el usuario.
 * Un error de cancelación (AbortError) no debe mostrarse: la página ya se
 * desmontó o cambió de filtros.
 */
export function mensajeDeError(error, porDefecto = MENSAJE_POR_DEFECTO) {
    if (!error || error.name === 'AbortError') {
        return '';
    }

    return error.message || porDefecto;
}

/**
 * Devuelve la lista de errores de validación enviada por el backend.
 */
export function detallesDeError(error) {
    return Array.isArray(error?.errors) ? error.errors : [];
}

/**
 * Indica si el error se debe a un problema de permisos o de estado.
 * Se usa para distinguir un 409 de una conexión perdida.
 */
export function esConflicto(error) {
    return error?.status === 409;
}
