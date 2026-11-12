// Validaciones del módulo de calificaciones.
// Coinciden con calificaciones.validation.js del backend.

export const PUNTUACIONES = [5, 4, 3, 2, 1];

const MAX_COMENTARIO = 500;

export const ETIQUETAS_PUNTUACION = {
    5: 'Excelente',
    4: 'Muy bueno',
    3: 'Bueno',
    2: 'Regular',
    1: 'Malo'
};

/**
 * Valida el formulario de calificación de un intercambio.
 */
export function validarCalificacion(datos) {
    const errores = {};
    const puntuacion = Number(datos.puntuacion);
    const comentario = datos.comentario.trim();

    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
        errores.puntuacion = 'Selecciona una puntuación entre 1 y 5.';
    }

    if ([...comentario].length > MAX_COMENTARIO) {
        errores.comentario = `El comentario no puede superar los ${MAX_COMENTARIO} caracteres.`;
    }

    return errores;
}
