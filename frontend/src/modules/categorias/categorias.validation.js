export function validarCategoria(datos) {
    const errores = {};

    const nombre = datos.nombre.trim();
    const descripcion = datos.descripcion.trim();

    if (!nombre) {
        errores.nombre = 'Escribe el nombre de la categoría.';
    } else if ([...nombre].length > 80) {
        errores.nombre = 'El nombre no puede superar los 80 caracteres.';
    }

    if ([...descripcion].length > 255) {
        errores.descripcion =
        'La descripción no puede superar los 255 caracteres.';
    }

    if (!['activo', 'inactivo'].includes(datos.estado)) {
        errores.estado = 'Por favor selecciona un estado válido.';
    }

    return errores;
}