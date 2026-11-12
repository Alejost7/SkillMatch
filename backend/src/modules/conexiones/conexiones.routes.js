// Rutas del módulo de conexiones.
// Todas las rutas son privadas: el usuario se identifica con el token y solo
// puede consultar las conexiones en las que participa.

import { Router } from 'express';

import {
    listarConexiones,
    obtenerConexion,
    finalizarConexion
} from './conexiones.controller.js';

import {
    validarFiltrosConexiones,
    validarIdConexion
} from './conexiones.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas.
router.use(autenticar);

// GET /api/conexiones?estado=activa&page=1&limit=10
router.get('/', validarFiltrosConexiones, listarConexiones);

// GET /api/conexiones/:id
router.get('/:id', validarIdConexion, obtenerConexion);

// PATCH /api/conexiones/:id/finalizar
router.patch('/:id/finalizar', validarIdConexion, finalizarConexion);

export default router;
