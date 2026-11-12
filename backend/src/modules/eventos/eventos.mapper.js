// Conversión de las filas del feed a objetos en camelCase.

// Solicitud pendiente recibida, con los datos visibles de quien la envió.
export function mapearSolicitudPendiente(fila) {
    return {
        idSolicitud: fila.id_solicitud,
        emisor: {
            idUsuario: fila.id_usuario_emisor,
            nombres: fila.nombres,
            apellidos: fila.apellidos,
            alias: fila.alias
        },
        mensajeInicial: fila.mensaje_inicial,
        fechaEnvio: fila.fecha_envio
    };
}

// Conexión finalizada pendiente de calificar por el usuario.
export function mapearPendienteCalificar(fila) {
    return {
        idConexion: fila.id_conexion,
        interlocutor: {
            idUsuario: fila.id_usuario,
            nombres: fila.nombres,
            apellidos: fila.apellidos,
            alias: fila.alias
        },
        fechaInicio: fila.fecha_inicio
    };
}
