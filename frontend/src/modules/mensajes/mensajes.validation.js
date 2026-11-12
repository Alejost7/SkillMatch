// Validación del formulario de mensajes.
// El backend acepta textos de 1 a 1000 caracteres y los guarda recortados.

const MAX_CONTENIDO = 1000;

/**
 * Devuelve los errores del mensaje. Un contenido vacío no se envía.
 */
export function validarMensaje(datos) {
    const errores = {};
    const contenido = datos.contenido.trim();

    if (contenido.length === 0) {
        errores.contenido = 'Escribe un mensaje antes de enviarlo.';
    } else if ([...contenido].length > MAX_CONTENIDO) {
        errores.contenido = `El mensaje no puede superar los ${MAX_CONTENIDO} caracteres.`;
    }

    return errores;
}

export { MAX_CONTENIDO };
