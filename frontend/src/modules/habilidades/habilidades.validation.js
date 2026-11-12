// Validaciones del formulario de habilidades del catálogo.
// Repiten las reglas del backend para dar respuesta inmediata al usuario.

export const ESTADOS_HABILIDAD = ['activo', 'inactivo'];

export function validarHabilidad(datos) {
    const errores = {};

    const nombre = datos.nombre.trim();
    const descripcion = datos.descripcion.trim();

    if (!datos.idCategoria) {
        errores.idCategoria = 'Selecciona la categoría de la habilidad.';
    }

    if (!nombre) {
        errores.nombre = 'Escribe el nombre de la habilidad.';
    } else if ([...nombre].length > 100) {
        errores.nombre = 'El nombre no puede superar los 100 caracteres.';
    }

    if ([...descripcion].length > 255) {
        errores.descripcion =
            'La descripción no puede superar los 255 caracteres.';
    }

    if (!ESTADOS_HABILIDAD.includes(datos.estado)) {
        errores.estado = 'Selecciona un estado válido.';
    }

    return errores;
}
