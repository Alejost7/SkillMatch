// Conversión de las filas SQL del módulo de solicitudes a objetos en camelCase.
// El emisor y el receptor se devuelven como objetos reducidos: solo datos
// públicos, sin correo electrónico ni estado de la cuenta.

export function mapearSolicitud(fila) {
    return {
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
        estado: fila.estado_solicitud,
        fechaEnvio: fila.fecha_envio,
        fechaRespuesta: fila.fecha_respuesta
    };
}
