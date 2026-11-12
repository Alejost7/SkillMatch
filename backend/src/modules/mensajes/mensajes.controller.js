// Controlador del módulo de mensajería.
// Todas las rutas son privadas: solo los participantes de una conexión
// pueden leer y escribir sus mensajes.

import * as mensajesService from './mensajes.service.js';

// GET /api/mensajes?conexionId=1&page=1&limit=10
// Con ?desde=<idMensaje> devuelve solo los mensajes nuevos, sin paginación.
export async function listarMensajes(req, res, next) {
    try {
        const resultado = await mensajesService.listarMensajes(
            req.usuario.idUsuario,
            res.locals.busquedaMensajes
        );

        // Modo delta: el cliente solo necesita los mensajes y el punto de
        // partida usado, para volver a preguntar con el id más alto.
        if (resultado.desde) {
            return res.status(200).json({
                success: true,
                message: 'Mensajes nuevos consultados correctamente.',
                data: resultado.mensajes,
                desde: resultado.desde
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mensajes consultados correctamente.',
            data: resultado.mensajes,
            paginacion: resultado.paginacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/mensajes/no-leidos
export async function obtenerResumenNoLeidos(req, res, next) {
    try {
        const resumen = await mensajesService.obtenerResumenNoLeidos(
            req.usuario.idUsuario
        );

        return res.status(200).json({
            success: true,
            message: 'Mensajes sin leer consultados correctamente.',
            data: resumen
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/mensajes
export async function enviarMensaje(req, res, next) {
    try {
        const mensaje = await mensajesService.enviarMensaje(
            req.usuario.idUsuario,
            res.locals.nuevoMensaje
        );

        return res.status(201).json({
            success: true,
            message: 'Mensaje enviado correctamente.',
            data: mensaje
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/mensajes/leidos
export async function marcarLeidos(req, res, next) {
    try {
        const resultado = await mensajesService.marcarLeidos(
            req.usuario.idUsuario,
            res.locals.marcarLeidos
        );

        return res.status(200).json({
            success: true,
            message: 'Mensajes marcados como leídos.',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}
