// Controlador de autenticación.
// Recibe las peticiones, llama al servicio y devuelve la respuesta HTTP.

import * as authService from './auth.service.js';

/**
 * POST /api/auth/registro
 */
export async function registrar(req, res, next) {
    try {
        const usuario = await authService.registrarUsuario(res.locals.usuario);

        return res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente.',
        data: usuario
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
    try {
        const resultado = await authService.iniciarSesion(
        res.locals.credenciales
        );

        return res.status(200).json({
        success: true,
        message: 'Autenticación satisfactoria.',
        data: resultado
        });
    } catch (error) {
        next(error);
    }
}