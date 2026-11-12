// Controlador del módulo de calificaciones.
// Todas las rutas son privadas: solo los participantes de una conexión pueden
// calificar el intercambio y consultar sus calificaciones.

import * as calificacionesService from './calificaciones.service.js';

// POST /api/calificaciones
export async function crearCalificacion(req, res, next) {
    try {
        const calificacion = await calificacionesService.crearCalificacion(
            req.usuario.idUsuario,
            res.locals.nuevaCalificacion
        );

        return res.status(201).json({
            success: true,
            message: 'Calificación registrada correctamente.',
            data: calificacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/calificaciones/usuario/:id?page=1&limit=10
export async function listarRecibidas(req, res, next) {
    try {
        const { calificaciones, resumen, paginacion } =
            await calificacionesService.listarRecibidas(
                req.usuario.idUsuario,
                res.locals.idUsuarioCalificado,
                res.locals.busquedaCalificaciones
            );

        return res.status(200).json({
            success: true,
            message: 'Calificaciones consultadas correctamente.',
            data: calificaciones,
            resumen,
            paginacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/calificaciones/conexion/:id
export async function listarPorConexion(req, res, next) {
    try {
        const { calificaciones, puedeCalificar } =
            await calificacionesService.listarPorConexion(
                req.usuario.idUsuario,
                res.locals.idConexionCalificacion
            );

        return res.status(200).json({
            success: true,
            message: 'Calificaciones consultadas correctamente.',
            data: calificaciones,
            puedeCalificar
        });
    } catch (error) {
        next(error);
    }
}
