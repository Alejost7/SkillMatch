// Servicio del módulo de eventos.
// Devuelve el resumen que el cliente pide al conectar y cuando recibe un
// evento "feed". Todo se deriva de datos existentes: no se persiste nada.

import * as eventosRepository from './eventos.repository.js';
import * as mensajesRepository from '../mensajes/mensajes.repository.js';
import {
    mapearSolicitudPendiente,
    mapearPendienteCalificar
} from './eventos.mapper.js';

// Resumen de lo que requiere la atención del usuario.
// Las consultas son independientes, así que se resuelven en paralelo.
export async function obtenerFeed(idUsuario) {
    const [
        totalSolicitudes,
        solicitudes,
        noLeidos,
        totalPorCalificar,
        porCalificar
    ] = await Promise.all([
        eventosRepository.contarSolicitudesPendientes(idUsuario),
        eventosRepository.buscarSolicitudesPendientes(idUsuario),
        mensajesRepository.contarNoLeidos(idUsuario),
        eventosRepository.contarPendientesDeCalificar(idUsuario),
        eventosRepository.buscarPendientesDeCalificar(idUsuario)
    ]);

    const totalMensajes = noLeidos.reduce(
        (suma, fila) => suma + Number(fila.total),
        0
    );

    return {
        actualizadoEn: new Date().toISOString(),
        total:
            totalSolicitudes + totalMensajes + totalPorCalificar,
        solicitudesPendientes: {
            total: totalSolicitudes,
            items: solicitudes.map(mapearSolicitudPendiente)
        },
        mensajesNoLeidos: {
            total: totalMensajes,
            porConexion: noLeidos.map((fila) => ({
                idConexion: fila.id_conexion,
                total: Number(fila.total)
            }))
        },
        pendientesDeCalificar: {
            total: totalPorCalificar,
            items: porCalificar.map(mapearPendienteCalificar)
        }
    };
}
