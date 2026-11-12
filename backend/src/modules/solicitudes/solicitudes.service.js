// Servicio del módulo de solicitudes de conexión.
// Contiene las reglas de negocio: quién puede enviar, responder y cancelar
// cada solicitud. Las consultas SQL se delegan al repositorio.

import * as solicitudesRepository from './solicitudes.repository.js';
import * as conexionesRepository from '../conexiones/conexiones.repository.js';
import * as usuariosRepository from '../usuarios/usuarios.repository.js';
import * as eventosRegistro from '../eventos/eventos.registro.js';
import { mapearSolicitud } from './solicitudes.mapper.js';
import { mapearConexion } from '../conexiones/conexiones.mapper.js';
import { construirPaginacion } from '../../utils/consulta.js';

// Mensajes reutilizados para que las respuestas sean consistentes.
const MENSAJE_SOLICITUD_NO_ENCONTRADA =
    'La solicitud no existe o no participas en ella.';
const MENSAJE_YA_RESPONDIDA = 'La solicitud ya fue respondida.';

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Avisa por SSE al otro participante de un cambio en una solicitud.
// Se llama solo después de que la base confirmó el cambio: la notificación es
// un extra en tiempo real, nunca la fuente de verdad.
function notificarSolicitud(idDestinatario, solicitud, extra = {}) {
    eventosRegistro.emitirA(idDestinatario, 'solicitud', {
        idSolicitud: solicitud.idSolicitud,
        estado: solicitud.estado,
        emisor: solicitud.emisor,
        receptor: solicitud.receptor,
        fechaEnvio: solicitud.fechaEnvio,
        ...extra
    });

    // El contador de solicitudes pendientes del destinatario cambió.
    eventosRegistro.emitirA(idDestinatario, 'feed', {
        motivo: 'solicitud',
        idSolicitud: solicitud.idSolicitud
    });
}

// Envía una solicitud de conexión a otro usuario.
export async function crearSolicitud(idUsuarioEmisor, datos) {
    const receptor = await usuariosRepository.findById(datos.idUsuarioReceptor);

    if (!receptor) {
        throw crearError(404, 'El usuario indicado no existe.');
    }

    if (receptor.estado_cuenta !== 'activo') {
        throw crearError(
            409,
            'El usuario indicado no está disponible para recibir solicitudes.'
        );
    }

    // Se revisan ambos sentidos para no duplicar la conversación.
    const pendiente = await solicitudesRepository.findPendienteEntreUsuarios(
        idUsuarioEmisor,
        receptor.id_usuario
    );

    if (pendiente) {
        throw crearError(409, 'Ya existe una solicitud pendiente entre ustedes.');
    }

    const conexionActiva =
        await solicitudesRepository.findConexionActivaEntreUsuarios(
            idUsuarioEmisor,
            receptor.id_usuario
        );

    if (conexionActiva) {
        throw crearError(409, 'Ya tienen una conexión activa.');
    }

    const fila = await solicitudesRepository.create(idUsuarioEmisor, datos);

    const solicitud = mapearSolicitud(fila);

    // Quien recibe la solicitud es el interesado en saberlo.
    notificarSolicitud(receptor.id_usuario, solicitud);

    return solicitud;
}

// Lista las solicitudes recibidas o enviadas por el usuario autenticado.
async function listar(
    idUsuario,
    direccion,
    { filtros, pagina, limite, desplazamiento }
) {
    const consulta = { idUsuario, direccion, estado: filtros.estado };

    const total = await solicitudesRepository.contar(consulta);
    const paginacion = construirPaginacion({ total, pagina, limite });

    // Si no hay resultados evitamos la consulta del listado.
    if (total === 0) {
        return { solicitudes: [], paginacion };
    }

    const filas = await solicitudesRepository.buscar({
        ...consulta,
        limite,
        desplazamiento
    });

    return { solicitudes: filas.map(mapearSolicitud), paginacion };
}

// Solicitudes que otras personas enviaron al usuario autenticado.
export function listarRecibidas(idUsuario, busqueda) {
    return listar(idUsuario, 'recibidas', busqueda);
}

// Solicitudes que el usuario autenticado envió a otras personas.
export function listarEnviadas(idUsuario, busqueda) {
    return listar(idUsuario, 'enviadas', busqueda);
}

// Consulta una solicitud en la que el usuario participa (emisor o receptor).
// Si no participa se responde 404 para no revelar la existencia del registro.
export async function obtenerSolicitud(idUsuario, idSolicitud) {
    const fila = await solicitudesRepository.findById(idSolicitud);

    if (
        !fila ||
        (fila.id_usuario_emisor !== idUsuario &&
            fila.id_usuario_receptor !== idUsuario)
    ) {
        throw crearError(404, MENSAJE_SOLICITUD_NO_ENCONTRADA);
    }

    return mapearSolicitud(fila);
}

// Busca la solicitud y comprueba que el usuario tenga el rol indicado.
// rol: 'emisor' para cancelar o 'receptor' para aceptar y rechazar.
async function buscarSolicitudGestionable(idUsuario, idSolicitud, rol) {
    const fila = await solicitudesRepository.findById(idSolicitud);

    if (!fila) {
        throw crearError(404, MENSAJE_SOLICITUD_NO_ENCONTRADA);
    }

    const idResponsable =
        rol === 'emisor' ? fila.id_usuario_emisor : fila.id_usuario_receptor;

    if (idResponsable !== idUsuario) {
        throw crearError(
            403,
            rol === 'emisor'
                ? 'Solo quien envió la solicitud puede cancelarla.'
                : 'Solo quien recibió la solicitud puede responderla.'
        );
    }

    return fila;
}

// Acepta una solicitud pendiente. Solo puede hacerlo el receptor.
// Al aceptar se crea la conexión entre ambos usuarios.
export async function aceptarSolicitud(idUsuario, idSolicitud) {
    const fila = await buscarSolicitudGestionable(
        idUsuario,
        idSolicitud,
        'receptor'
    );

    if (fila.estado_solicitud !== 'pendiente') {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    // La transacción vuelve a comprobar el estado: si otra petición respondió
    // antes, no se crea una segunda conexión.
    const creada = await solicitudesRepository.aceptar(idSolicitud);

    if (!creada) {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    const [solicitud, conexion] = await Promise.all([
        solicitudesRepository.findById(idSolicitud),
        conexionesRepository.findById(creada.idConexion)
    ]);

    const mapeada = mapearSolicitud(solicitud);
    const conexionMapeada = mapearConexion(conexion);

    // Quien envió la solicitud espera la respuesta.
    notificarSolicitud(mapeada.emisor.idUsuario, mapeada, {
        idConexion: conexionMapeada.idConexion
    });

    return {
        solicitud: mapeada,
        conexion: conexionMapeada
    };
}

// Rechaza una solicitud pendiente. Solo puede hacerlo el receptor.
export async function rechazarSolicitud(idUsuario, idSolicitud) {
    const fila = await buscarSolicitudGestionable(
        idUsuario,
        idSolicitud,
        'receptor'
    );

    if (fila.estado_solicitud !== 'pendiente') {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    const actualizada = await solicitudesRepository.responder(
        idSolicitud,
        'rechazada'
    );

    if (!actualizada) {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    const solicitud = mapearSolicitud(
        await solicitudesRepository.findById(idSolicitud)
    );

    // Quien envió la solicitud espera la respuesta.
    notificarSolicitud(solicitud.emisor.idUsuario, solicitud);

    return solicitud;
}

// Cancela una solicitud pendiente. Solo puede hacerlo el emisor.
export async function cancelarSolicitud(idUsuario, idSolicitud) {
    const fila = await buscarSolicitudGestionable(
        idUsuario,
        idSolicitud,
        'emisor'
    );

    if (fila.estado_solicitud !== 'pendiente') {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    const actualizada = await solicitudesRepository.responder(
        idSolicitud,
        'cancelada'
    );

    if (!actualizada) {
        throw crearError(409, MENSAJE_YA_RESPONDIDA);
    }

    const solicitud = mapearSolicitud(
        await solicitudesRepository.findById(idSolicitud)
    );

    // Quien recibió la solicitud ya no necesita responderla.
    notificarSolicitud(solicitud.receptor.idUsuario, solicitud);

    return solicitud;
}
