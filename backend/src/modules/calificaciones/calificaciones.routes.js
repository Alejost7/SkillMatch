// Rutas del módulo de calificaciones.
// Todas las rutas son privadas: el usuario se identifica con el token y solo
// puede calificar intercambios en los que participa.

import { Router } from 'express';

import {
    crearCalificacion,
    listarRecibidas,
    listarPorConexion
} from './calificaciones.controller.js';

import {
    validarCrearCalificacion,
    validarIdUsuarioCalificado,
    validarIdConexionCalificacion,
    validarPaginacionCalificaciones
} from './calificaciones.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas.
router.use(autenticar);

// POST /api/calificaciones
router.post('/', validarCrearCalificacion, crearCalificacion);

// GET /api/calificaciones/usuario/:id?page=1&limit=10
router.get(
    '/usuario/:id',
    validarIdUsuarioCalificado,
    validarPaginacionCalificaciones,
    listarRecibidas
);

// GET /api/calificaciones/conexion/:id
router.get(
    '/conexion/:id',
    validarIdConexionCalificacion,
    listarPorConexion
);

export default router;
