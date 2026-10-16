import { Router } from 'express';

import {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from './categorias.controller.js';

import {
    validarIdCategoria,
    validarCrearCategoria,
    validarActualizarCategoria
} from './categorias.validation.js';

const router = Router();

router.get('/', listarCategorias);
router.get('/:id', validarIdCategoria, obtenerCategoria);

router.post(
    '/',
    validarCrearCategoria,
    crearCategoria
);

router.put('/:id', validarIdCategoria, validarActualizarCategoria, actualizarCategoria);
router.delete('/:id', validarIdCategoria, eliminarCategoria);

export default router;