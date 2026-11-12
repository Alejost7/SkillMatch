// Controlador del módulo de conexiones.
// Todas las rutas son privadas: solo los participantes ven sus conexiones.

import * as conexionesService from './conexiones.service.js';

// GET /api/conexiones
export async function listarConexiones(req, res, next) {
    try {
        const { conexiones, paginacion } =
            await conexionesService.listarConexiones(
                req.usuario.idUsuario,
                res.locals.busquedaConexiones
            );

        return res.status(200).json({
            success: true,
            message: 'Conexiones consultadas correctamente.',
            data: conexiones,
            paginacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/conexiones/:id
export async function obtenerConexion(req, res, next) {
    try {
        const conexion = await conexionesService.obtenerConexion(
            req.usuario.idUsuario,
            res.locals.idConexion
        );

        return res.status(200).json({
            success: true,
            message: 'Conexión consultada correctamente.',
            data: conexion
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/conexiones/:id/finalizar
export async function finalizarConexion(req, res, next) {
    try {
        const conexion = await conexionesService.finalizarConexion(
            req.usuario.idUsuario,
            res.locals.idConexion
        );

        return res.status(200).json({
            success: true,
            message: 'Conexión finalizada correctamente.',
            data: conexion
        });
    } catch (error) {
        next(error);
    }
}
