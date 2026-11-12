// Conversión de las filas SQL del módulo de conexiones a objetos en camelCase.

// Devuelve la conexión con los datos públicos de sus dos participantes.
export function mapearConexion(fila) {
    return {
        idConexion: fila.id_conexion,
        idSolicitud: fila.id_solicitud,
        emisor: {
            idUsuario: fila.id_usuario_emisor,
            nombres: fila.emisor_nombres,
            apellidos: fila.emisor_apellidos,
            alias: fila.emisor_alias
        },
        receptor: {
            idUsuario: fila.id_usuario_receptor,
            nombres: fila.receptor_nombres,
            apellidos: fila.receptor_apellidos,
            alias: fila.receptor_alias
        },
        mensajeInicial: fila.mensaje_inicial,
        estado: fila.estado_conexion,
        fechaInicio: fila.fecha_inicio
    };
}

// Devuelve la conexión vista desde un participante concreto: agrega
// "interlocutor" con la persona con la que se comparte la conexión, para que
// el cliente no tenga que decidir cuál de los dos participantes mostrar.
export function mapearConexionParaUsuario(fila, idUsuario) {
    const conexion = mapearConexion(fila);

    const interlocutor =
        conexion.emisor.idUsuario === idUsuario
            ? conexion.receptor
            : conexion.emisor;

    return { ...conexion, interlocutor };
}
