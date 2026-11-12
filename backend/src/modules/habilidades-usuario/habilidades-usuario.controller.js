// Controlador del módulo de habilidades del usuario.
// Todas las rutas son privadas: cada usuario administra únicamente sus propias
// habilidades ofrecidas y requeridas.

import * as habilidadesUsuarioService from './habilidades-usuario.service.js';

// GET /api/habilidades-usuario/ofrecidas
export async function listarOfrecidas(req, res, next) {
    try {
        const habilidades = await habilidadesUsuarioService.listarOfrecidas(
            req.usuario.idUsuario
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidades ofrecidas consultadas correctamente.',
            data: habilidades
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/habilidades-usuario/ofrecidas
export async function registrarOfrecida(req, res, next) {
    try {
        const habilidad = await habilidadesUsuarioService.registrarOfrecida(
            req.usuario.idUsuario,
            res.locals.ofrecida
        );

        return res.status(201).json({
            success: true,
            message: 'Habilidad ofrecida registrada correctamente.',
            data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/habilidades-usuario/ofrecidas/:id
export async function actualizarOfrecida(req, res, next) {
    try {
        const habilidad = await habilidadesUsuarioService.actualizarOfrecida(
            req.usuario.idUsuario,
            res.locals.idHabilidadOfrecida,
            res.locals.ofrecida
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidad ofrecida actualizada correctamente.',
            data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/habilidades-usuario/ofrecidas/:id
export async function eliminarOfrecida(req, res, next) {
    try {
        await habilidadesUsuarioService.eliminarOfrecida(
            req.usuario.idUsuario,
            res.locals.idHabilidadOfrecida
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidad ofrecida eliminada correctamente.'
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/habilidades-usuario/requeridas
export async function listarRequeridas(req, res, next) {
    try {
        const habilidades = await habilidadesUsuarioService.listarRequeridas(
            req.usuario.idUsuario
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidades requeridas consultadas correctamente.',
            data: habilidades
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/habilidades-usuario/requeridas
export async function registrarRequerida(req, res, next) {
    try {
        const habilidad = await habilidadesUsuarioService.registrarRequerida(
            req.usuario.idUsuario,
            res.locals.requerida
        );

        return res.status(201).json({
            success: true,
            message: 'Habilidad requerida registrada correctamente.',
            data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/habilidades-usuario/requeridas/:id
export async function actualizarRequerida(req, res, next) {
    try {
        const habilidad = await habilidadesUsuarioService.actualizarRequerida(
            req.usuario.idUsuario,
            res.locals.idHabilidadRequerida,
            res.locals.requerida
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidad requerida actualizada correctamente.',
            data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/habilidades-usuario/requeridas/:id
export async function eliminarRequerida(req, res, next) {
    try {
        await habilidadesUsuarioService.eliminarRequerida(
            req.usuario.idUsuario,
            res.locals.idHabilidadRequerida
        );

        return res.status(200).json({
            success: true,
            message: 'Habilidad requerida eliminada correctamente.'
        });
    } catch (error) {
        next(error);
    }
}
