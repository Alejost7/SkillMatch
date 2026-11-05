// Controlador del módulo de habilidades.
// Recibe las peticiones, llama al servicio y devuelve la respuesta HTTP.

import * as habilidadesService from './habilidades.service.js';

// Lista todas las habilidades o las filtra por categoría.
export async function listarHabilidades(req, res, next) {
    try {
        const habilidades = await habilidadesService.listarHabilidades(
        res.locals.idCategoria
        );

        return res.status(200).json({
        success: true,
        message: 'Habilidades consultadas correctamente.',
        data: habilidades
        });
    } catch (error) {
        next(error);
    }
}

// Consulta una habilidad por su identificador.
export async function obtenerHabilidad(req, res, next) {
    try {
        const habilidad = await habilidadesService.obtenerHabilidad(
        res.locals.idHabilidad
        );

        return res.status(200).json({
        success: true,
        message: 'Habilidad consultada correctamente.',
        data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// Crea una nueva habilidad.
export async function crearHabilidad(req, res, next) {
    try {
        const habilidad = await habilidadesService.crearHabilidad(
        res.locals.habilidad
        );

        return res.status(201).json({
        success: true,
        message: 'Habilidad creada correctamente.',
        data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// Actualiza una habilidad existente.
export async function actualizarHabilidad(req, res, next) {
    try {
        const habilidad = await habilidadesService.actualizarHabilidad(
        res.locals.idHabilidad,
        res.locals.habilidad
        );

        return res.status(200).json({
        success: true,
        message: 'Habilidad actualizada correctamente.',
        data: habilidad
        });
    } catch (error) {
        next(error);
    }
}

// Elimina una habilidad.
export async function eliminarHabilidad(req, res, next) {
    try {
        await habilidadesService.eliminarHabilidad(res.locals.idHabilidad);

        return res.status(200).json({
        success: true,
        message: 'Habilidad eliminada correctamente.'
        });
    } catch (error) {
        next(error);
    }
}