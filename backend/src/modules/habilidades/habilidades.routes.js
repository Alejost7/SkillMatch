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

import { autenticar, autorizarAdministrador } from '../../middlewares/autenticacion.js';

const router = Router();

// Rutas públicas: cualquiera puede consultar el catálogo de habilidades.
// GET /api/habilidades
// GET /api/habilidades?categoriaId=1
router.get('/', validarFiltroCategoria, listarHabilidades);

// GET /api/habilidades/5
router.get('/:id', validarIdHabilidad, obtenerHabilidad);

// Rutas protegidas: solo un administrador autenticado puede modificar el catálogo.

// POST /api/habilidades
router.post(
    '/',
    autenticar,
    autorizarAdministrador,
    validarCrearHabilidad,
    crearHabilidad
);

// PUT /api/habilidades/5
router.put(
    '/:id',
    autenticar,
    autorizarAdministrador,
    validarIdHabilidad,
    validarActualizarHabilidad,
    actualizarHabilidad
);

// DELETE /api/habilidades/5
router.delete(
    '/:id',
    autenticar,
    autorizarAdministrador,
    validarIdHabilidad,
    eliminarHabilidad
);

export default router;