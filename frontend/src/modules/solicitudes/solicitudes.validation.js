// Validaciones del módulo de solicitudes de conexión.

// Coincide con la decisión del backend (solicitudes.validation.js).
const MAX_MENSAJE_INICIAL = 500;

/**
 * Valida el mensaje inicial de una solicitud. Es opcional.
 */
export function validarSolicitud(datos) {
    const errores = {};
    const mensaje = datos.mensajeInicial.trim();

    if ([...mensaje].length > MAX_MENSAJE_INICIAL) {
        errores.mensajeInicial = `El mensaje no puede superar los ${MAX_MENSAJE_INICIAL} caracteres.`;
    }

    return errores;
}
