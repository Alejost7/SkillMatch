import * as categoriasService from './categorias.service.js';

export async function listarCategorias(req, res, next) {
    try {
        const categorias = await categoriasService.listarCategorias();

        return res.status(200).json({
        success: true,
        message: 'Categorías consultadas correctamente.',
        data: categorias
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerCategoria(req, res, next) {
    try {
        const categoria = await categoriasService.obtenerCategoria(
        res.locals.idCategoria
        );

        return res.status(200).json({
        success: true,
        message: 'Categoría consultada correctamente.',
        data: categoria
        });
    } catch (error) {
        next(error);
    }
}

export async function crearCategoria(req, res, next) {
    try {
        const categoria = await categoriasService.crearCategoria(
        res.locals.categoria
        );

        return res.status(201).json({
        success: true,
        message: 'Categoría creada correctamente.',
        data: categoria
        });
    } catch (error) {
        next(error);
    }
}

export async function actualizarCategoria(req, res, next) {
    try {
        const categoria = await categoriasService.actualizarCategoria(
        res.locals.idCategoria,
        res.locals.categoria
        );

        return res.status(200).json({
        success: true,
        message: 'Categoría actualizada correctamente.',
        data: categoria
        });
    } catch (error) {
        next(error);
    }
}

export async function eliminarCategoria(req, res, next) {
    try {
        await categoriasService.eliminarCategoria(
        res.locals.idCategoria
        );

        return res.status(200).json({
        success: true,
        message: 'Categoría eliminada correctamente.'
        });
    } catch (error) {
        next(error);
    }
}