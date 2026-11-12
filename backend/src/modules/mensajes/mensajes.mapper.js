// Conversión de las filas SQL del módulo de mensajería a objetos en camelCase.

// Devuelve el mensaje con los datos públicos de quien lo escribió.
export function mapearMensaje(fila) {
    return {
        idMensaje: fila.id_mensaje,
        idConexion: fila.id_conexion,
        remitente: {
            idUsuario: fila.id_remitente,
            nombres: fila.remitente_nombres,
            apellidos: fila.remitente_apellidos,
            alias: fila.remitente_alias
        },
        contenido: fila.contenido,
        // MySQL devuelve el BOOLEAN como 0 o 1.
        leido: Boolean(fila.leido),
        fechaEnvio: fila.fecha_envio
    };
}

// Devuelve el mensaje visto por un usuario concreto.
// "esPropio" permite al cliente alinear la burbuja sin comparar identificadores.
export function mapearMensajeParaUsuario(fila, idUsuario) {
    const mensaje = mapearMensaje(fila);

    return { ...mensaje, esPropio: mensaje.remitente.idUsuario === idUsuario };
}
