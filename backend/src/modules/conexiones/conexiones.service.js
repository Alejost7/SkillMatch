// Servicio del módulo de conexiones.
// Una conexión representa un intercambio aceptado entre dos usuarios.

import * as conexionesRepository from './conexiones.repository.js';
import * as mensajesRepository from '../mensajes/mensajes.repository.js';
import { mapearConexionParaUsuario } from './conexiones.mapper.js';
import { construirPaginacion } from '../../utils/consulta.js';

// Mensaje único para conexiones inexistentes o ajenas: no se revela si el
// registro existe cuando el usuario no participa en él.
const MENSAJE_CONEXION_NO_ENCONTRADA =
    'La conexión no existe o no participas en ella.';

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

// Agrega a la conexión ya mapeada cuántos mensajes esperan ser leídos por el
// usuario, para que el cliente pueda mostrar la insignia de la conversación.
async function agregarNoLeidos(conexion, idUsuario) {
    const noLeidos = await mensajesRepository.contarNoLeidosDeConexion(
        conexion.idConexion,
        idUsuario
    );

    return { ...conexion, noLeidos };
}

// Lista las conexiones del usuario autenticado con paginación.
export async function listarConexiones(
    idUsuario,
    { filtros, pagina, limite, desplazamiento }
) {
    const consulta = { idUsuario, estado: filtros.estado };

    const total = await conexionesRepository.contar(consulta);
    const paginacion = construirPaginacion({ total, pagina, limite });

    // Si no hay resultados evitamos la consulta del listado.
    if (total === 0) {
        return { conexiones: [], paginacion };
    }

    const filas = await conexionesRepository.buscar({
        ...consulta,
        limite,
        desplazamiento
    });

    // Una sola consulta agrupada evita preguntar por cada conexión.
    const sinLeer = await mensajesRepository.contarNoLeidos(idUsuario);
    const mapaSinLeer = new Map(
        sinLeer.map((fila) => [fila.id_conexion, Number(fila.total)])
    );

    const conexiones = filas.map((fila) => ({
        ...mapearConexionParaUsuario(fila, idUsuario),
        noLeidos: mapaSinLeer.get(fila.id_conexion) ?? 0
    }));

    return { conexiones, paginacion };
}

// Consulta una conexión en la que el usuario participa.
export async function obtenerConexion(idUsuario, idConexion) {
    const fila = await conexionesRepository.findById(idConexion);

    if (!fila || !esParticipante(fila, idUsuario)) {
        throw crearError(404, MENSAJE_CONEXION_NO_ENCONTRADA);
    }

    return agregarNoLeidos(
        mapearConexionParaUsuario(fila, idUsuario),
        idUsuario
    );
}

// Finaliza una conexión activa. Cualquiera de los dos participantes puede
// hacerlo cuando el intercambio termina.
export async function finalizarConexion(idUsuario, idConexion) {
    const fila = await conexionesRepository.findById(idConexion);

    if (!fila || !esParticipante(fila, idUsuario)) {
        throw crearError(404, MENSAJE_CONEXION_NO_ENCONTRADA);
    }

    if (fila.estado_conexion !== 'activa') {
        throw crearError(409, 'La conexión ya no está activa.');
    }

    const actualizada = await conexionesRepository.updateEstado(
        idConexion,
        'finalizada'
    );

    // Si otra petición la finalizó antes, el UPDATE no afecta filas.
    if (!actualizada) {
        throw crearError(409, 'La conexión ya no está activa.');
    }

    const conexion = await conexionesRepository.findById(idConexion);

    return agregarNoLeidos(
        mapearConexionParaUsuario(conexion, idUsuario),
        idUsuario
    );
}
