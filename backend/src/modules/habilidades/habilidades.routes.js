// Rutas del módulo de habilidades.

import { Router } from 'express';

import {
    listarHabilidades,
    obtenerHabilidad,
    crearHabilidad,
    actualizarHabilidad,
    eliminarHabilidad
} from './habilidades.controller.js';

import {
    validarIdHabilidad,
    validarFiltroCategoria,
    validarCrearHabilidad,
    validarActualizarHabilidad
} from './habilidades.validation.js';

const router = Router();

// GET /api/habilidades
// GET /api/habilidades?categoriaId=1
router.get('/', validarFiltroCategoria, listarHabilidades);

// GET /api/habilidades/5
router.get('/:id', validarIdHabilidad, obtenerHabilidad);

// POST /api/habilidades
router.post('/', validarCrearHabilidad, crearHabilidad);

// PUT /api/habilidades/5
router.put(
    '/:id',
    validarIdHabilidad,
    validarActualizarHabilidad,
    actualizarHabilidad
);

// DELETE /api/habilidades/5
router.delete('/:id', validarIdHabilidad, eliminarHabilidad);

export default router;