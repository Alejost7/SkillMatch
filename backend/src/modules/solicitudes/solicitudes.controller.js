// Controlador del módulo de solicitudes de conexión.
// Todas las rutas son privadas: el usuario se identifica con el token.

import * as solicitudesService from './solicitudes.service.js';

// POST /api/solicitudes
export async function crearSolicitud(req, res, next) {
    try {
        const solicitud = await solicitudesService.crearSolicitud(
            req.usuario.idUsuario,
            res.locals.nuevaSolicitud
        );

        return res.status(201).json({
            success: true,
            message: 'Solicitud enviada correctamente.',
            data: solicitud
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/solicitudes/recibidas
export async function listarRecibidas(req, res, next) {
    try {
        const { solicitudes, paginacion } =
            await solicitudesService.listarRecibidas(
                req.usuario.idUsuario,
                res.locals.busquedaSolicitudes
            );

        return res.status(200).json({
            success: true,
            message: 'Solicitudes recibidas consultadas correctamente.',
            data: solicitudes,
            paginacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/solicitudes/enviadas
export async function listarEnviadas(req, res, next) {
    try {
        const { solicitudes, paginacion } =
            await solicitudesService.listarEnviadas(
                req.usuario.idUsuario,
                res.locals.busquedaSolicitudes
            );

        return res.status(200).json({
            success: true,
            message: 'Solicitudes enviadas consultadas correctamente.',
            data: solicitudes,
            paginacion
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/solicitudes/:id
export async function obtenerSolicitud(req, res, next) {
    try {
        const solicitud = await solicitudesService.obtenerSolicitud(
            req.usuario.idUsuario,
            res.locals.idSolicitud
        );

        return res.status(200).json({
            success: true,
            message: 'Solicitud consultada correctamente.',
            data: solicitud
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/solicitudes/:id/aceptar
export async function aceptarSolicitud(req, res, next) {
    try {
        const resultado = await solicitudesService.aceptarSolicitud(
            req.usuario.idUsuario,
            res.locals.idSolicitud
        );

        return res.status(200).json({
            success: true,
            message: 'Solicitud aceptada correctamente.',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/solicitudes/:id/rechazar
export async function rechazarSolicitud(req, res, next) {
    try {
        const solicitud = await solicitudesService.rechazarSolicitud(
            req.usuario.idUsuario,
            res.locals.idSolicitud
        );

        return res.status(200).json({
            success: true,
            message: 'Solicitud rechazada correctamente.',
            data: solicitud
        });
    } catch (error) {
        next(error);
    }
}

// PATCH /api/solicitudes/:id/cancelar
export async function cancelarSolicitud(req, res, next) {
    try {
        const solicitud = await solicitudesService.cancelarSolicitud(
            req.usuario.idUsuario,
            res.locals.idSolicitud
        );

        return res.status(200).json({
            success: true,
            message: 'Solicitud cancelada correctamente.',
            data: solicitud
        });
    } catch (error) {
        next(error);
    }
}
