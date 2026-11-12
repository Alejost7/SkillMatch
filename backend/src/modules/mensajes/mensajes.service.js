// Servicio del módulo de mensajería.
// Solo los participantes de una conexión pueden escribir y leer sus mensajes,
// y solo mientras la conexión siga activa.

import * as mensajesRepository from './mensajes.repository.js';
import * as conexionesRepository from '../conexiones/conexiones.repository.js';
import * as eventosRegistro from '../eventos/eventos.registro.js';
import { mapearMensajeParaUsuario } from './mensajes.mapper.js';
import { construirPaginacion, LIMITE_MAXIMO } from '../../utils/consulta.js';

// Mensaje único para conexiones inexistentes o ajenas: no se revela si el
// registro existe cuando el usuario no participa en él.
const MENSAJE_CONEXION_NO_ENCONTRADA =
    'La conexión no existe o no participas en ella.';
const MENSAJE_CONEXION_INACTIVA =
    'La conversación ya no está activa y no admite mensajes.';

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Indica si el usuario participa en la conexión.
function esParticipante(fila, idUsuario) {
    return (
        fila.id_usuario_emisor === idUsuario ||
        fila.id_usuario_receptor === idUsuario
    );
}

// Busca la conexión comprobando que el usuario participe en ella.
async function buscarConexion(idUsuario, idConexion) {
    const fila = await conexionesRepository.findById(idConexion);

    if (!fila || !esParticipante(fila, idUsuario)) {
        throw crearError(404, MENSAJE_CONEXION_NO_ENCONTRADA);
    }

    return fila;
}

// Avisa al otro participante por SSE. Se emite después de guardar en la base:
// si el envío en tiempo real falla, el mensaje ya está persistido y el cliente
// lo recupera con el sondeo delta.
function notificarMensaje(mensaje, conexion, idUsuario) {
    const idDestinatario =
        conexion.id_usuario_emisor === idUsuario
            ? conexion.id_usuario_receptor
            : conexion.id_usuario_emisor;

    eventosRegistro.emitirA(idDestinatario, 'mensaje', {
        idMensaje: mensaje.idMensaje,
        idConexion: mensaje.idConexion,
        remitente: mensaje.remitente,
        contenido: mensaje.contenido,
        fechaEnvio: mensaje.fechaEnvio
    });

    // El contador de no leídos del destinatario cambió.
    eventosRegistro.emitirA(idDestinatario, 'feed', {
        motivo: 'mensaje',
        idConexion: mensaje.idConexion
    });
}

// Escribe un mensaje en una conversación activa.
export async function enviarMensaje(idUsuario, { idConexion, contenido }) {
    const conexion = await buscarConexion(idUsuario, idConexion);

    if (conexion.estado_conexion !== 'activa') {
        throw crearError(409, MENSAJE_CONEXION_INACTIVA);
    }

    const fila = await mensajesRepository.create(
        idConexion,
        idUsuario,
        contenido
    );

    const mensaje = mapearMensajeParaUsuario(fila, idUsuario);

    notificarMensaje(mensaje, conexion, idUsuario);

    return mensaje;
}

// Lista los mensajes que el usuario puede ver. Si se indica conexionId se
// revisa primero que la conexión sea suya para no filtrar conversaciones ajenas.
export async function listarMensajes(
    idUsuario,
    { filtros, pagina, limite, desplazamiento }
) {
    if (filtros.idConexion) {
        await buscarConexion(idUsuario, filtros.idConexion);
    }

    const consulta = {
        idUsuario,
        idConexion: filtros.idConexion,
        desde: filtros.desde
    };

    // Sondeo delta: solo los mensajes posteriores al último visto, sin COUNT
    // ni paginación. El cliente avanza su "desde" con el idMensaje mayor.
    if (consulta.desde) {
        const filas = await mensajesRepository.buscar({
            ...consulta,
            limite: LIMITE_MAXIMO,
            desplazamiento: 0
        });

        return {
            mensajes: filas.map((fila) =>
                mapearMensajeParaUsuario(fila, idUsuario)
            ),
            desde: consulta.desde
        };
    }

    const total = await mensajesRepository.contar(consulta);
    const paginacion = construirPaginacion({ total, pagina, limite });

    // Si no hay resultados evitamos la consulta del listado.
    if (total === 0) {
        return { mensajes: [], paginacion };
    }

    const filas = await mensajesRepository.buscar({
        ...consulta,
        limite,
        desplazamiento
    });

    const mensajes = filas.map((fila) =>
        mapearMensajeParaUsuario(fila, idUsuario)
    );

    return { mensajes, paginacion };
}

// Marca como leídos los mensajes recibidos en una conexión.
export async function marcarLeidos(idUsuario, { idConexion }) {
    await buscarConexion(idUsuario, idConexion);

    const actualizados = await mensajesRepository.marcarLeidos(
        idConexion,
        idUsuario
    );

    return { idConexion, actualizados };
}

// Resume los mensajes sin leer del usuario para las insignias del cliente.
export async function obtenerResumenNoLeidos(idUsuario) {
    const filas = await mensajesRepository.contarNoLeidos(idUsuario);

    const porConexion = filas.map((fila) => ({
        idConexion: fila.id_conexion,
        total: Number(fila.total)
    }));

    const total = porConexion.reduce((suma, fila) => suma + fila.total, 0);

    return { total, porConexion };
}
