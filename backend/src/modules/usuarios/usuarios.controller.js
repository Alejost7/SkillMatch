// Controlador del módulo de usuarios.

import * as usuariosService from './usuarios.service.js';

// GET /api/usuarios/perfil
export async function obtenerPerfil(req, res, next) {
    try {
        const usuario = await usuariosService.obtenerPerfil(
        req.usuario.idUsuario
        );

        return res.status(200).json({
        success: true,
        message: 'Perfil consultado correctamente.',
        data: usuario
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/usuarios/:id
export async function obtenerUsuario(req, res, next) {
    try {
        const usuario = await usuariosService.obtenerUsuario(
        res.locals.idUsuario
        );

        return res.status(200).json({
        success: true,
        message: 'Usuario consultado correctamente.',
        data: usuario
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/usuarios/perfil
export async function actualizarPerfil(req, res, next) {
    try {
        const usuario = await usuariosService.actualizarPerfil(
        req.usuario.idUsuario,
        res.locals.datosUsuario
        );

        return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente.',
        data: usuario
        });
    } catch (error) {
        next(error);
    }
}