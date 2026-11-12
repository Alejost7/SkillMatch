// Conversión de las filas SQL del módulo de calificaciones a objetos en camelCase.

// Devuelve la calificación con los datos públicos del calificador y del
// calificado.
export function mapearCalificacion(fila) {
    return {
        idCalificacion: fila.id_calificacion,
        idConexion: fila.id_conexion,
        calificador: {
            idUsuario: fila.id_calificador,
            nombres: fila.calificador_nombres,
            apellidos: fila.calificador_apellidos,
            alias: fila.calificador_alias
        },
        calificado: {
            idUsuario: fila.id_calificado,
            nombres: fila.calificado_nombres,
            apellidos: fila.calificado_apellidos,
            alias: fila.calificado_alias
        },
        puntuacion: fila.puntuacion,
        comentario: fila.comentario,
        fechaCalificacion: fila.fecha_calificacion
    };
}

// Devuelve la calificación vista por un usuario concreto.
// "esPropia" indica si la escribió el usuario autenticado.
export function mapearCalificacionParaUsuario(fila, idUsuario) {
    const calificacion = mapearCalificacion(fila);

    return { ...calificacion, esPropia: fila.id_calificador === idUsuario };
}
