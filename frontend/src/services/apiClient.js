import { cerrarSesionExpirada, obtenerToken } from './sesion.js';

// En desarrollo las peticiones pasan por el proxy de Vite (/api). En producción
// se puede apuntar a otro dominio con VITE_API_URL, por ejemplo
// https://api.skillmatch.com/api
const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');

const MENSAJE_SIN_CONEXION =
    'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

const MENSAJE_RESPUESTA_INVALIDA =
    'El servidor no devolvió una respuesta JSON. Revisa que el backend esté funcionando.';

// Crea el Error que consumen las páginas, con el código HTTP y la lista de
// errores de validación que envía el backend.
function crearError(mensaje, status, errors = []) {
    const error = new Error(mensaje);

    error.status = status;
    error.errors = errors;

    return error;
}

/**
 * Realiza una petición al backend de SkillMatch.
 *
 * - Agrega el token de la sesión en el encabezado Authorization.
 * - Si el backend responde 401 con un token enviado, cierra la sesión y avisa
 *   a la aplicación para que redirija al inicio de sesión.
 * - Lanza un Error con status y errors cuando la respuesta no es exitosa.
 * - Propaga AbortError sin modificarlo para que las páginas cancelen cargas.
 */
export async function apiClient(path, { omitirToken = false, ...options } = {}) {
    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');

    if (options.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const token = omitirToken ? null : obtenerToken();

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }

        throw crearError(MENSAJE_SIN_CONEXION, 0);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const tieneJson = contentType.includes('application/json');
    const resultado = tieneJson ? await response.json() : null;

    if (response.status === 401 && token) {
        // El token ya no es válido: se limpia la sesión local.
        cerrarSesionExpirada();
    }

    if (!response.ok) {
        const mensaje =
            resultado?.message ??
            (tieneJson
                ? 'No fue posible completar la operación.'
                : MENSAJE_RESPUESTA_INVALIDA);

        const error = crearError(
            mensaje,
            response.status,
            resultado?.errors ?? []
        );

        // La respuesta completa queda disponible por si la vista necesita más.
        error.resultado = resultado;

        throw error;
    }

    return resultado;
}

// En esta capa se centralizan las peticiones, el token y los errores para no
// repetir código en cada módulo del frontend.