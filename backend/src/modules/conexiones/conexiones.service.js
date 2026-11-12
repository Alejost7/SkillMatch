// Servicio del módulo de conexiones.
// Una conexión representa un intercambio aceptado entre dos usuarios.

import * as conexionesRepository from './conexiones.repository.js';
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

    const conexiones = filas.map((fila) =>
        mapearConexionParaUsuario(fila, idUsuario)
    );

    return { conexiones, paginacion };
}

// Consulta una conexión en la que el usuario participa.
export async function obtenerConexion(idUsuario, idConexion) {
    const fila = await conexionesRepository.findById(idConexion);

    if (!fila || !esParticipante(fila, idUsuario)) {
        throw crearError(404, MENSAJE_CONEXION_NO_ENCONTRADA);
    }

    return mapearConexionParaUsuario(fila, idUsuario);
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

    return mapearConexionParaUsuario(conexion, idUsuario);
}
