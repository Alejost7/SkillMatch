// Rutas del módulo de solicitudes de conexión.
// Todas las rutas son privadas: el usuario se identifica con el token.

import { Router } from 'express';

import {
    crearSolicitud,
    listarRecibidas,
    listarEnviadas,
    obtenerSolicitud,
    aceptarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud
} from './solicitudes.controller.js';

import {
    validarCrearSolicitud,
    validarFiltrosSolicitudes,
    validarIdSolicitud
} from './solicitudes.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas.
router.use(autenticar);

// POST /api/solicitudes
router.post('/', validarCrearSolicitud, crearSolicitud);

// Los listados se declaran antes de /:id para que "recibidas" y "enviadas" no
// se interpreten como identificadores.
// GET /api/solicitudes/recibidas?estado=pendiente&page=1&limit=10
router.get('/recibidas', validarFiltrosSolicitudes, listarRecibidas);

// GET /api/solicitudes/enviadas?estado=aceptada&page=1&limit=10
router.get('/enviadas', validarFiltrosSolicitudes, listarEnviadas);

// GET /api/solicitudes/:id
router.get('/:id', validarIdSolicitud, obtenerSolicitud);

// PATCH /api/solicitudes/:id/aceptar
router.patch('/:id/aceptar', validarIdSolicitud, aceptarSolicitud);

// PATCH /api/solicitudes/:id/rechazar
router.patch('/:id/rechazar', validarIdSolicitud, rechazarSolicitud);

// PATCH /api/solicitudes/:id/cancelar
router.patch('/:id/cancelar', validarIdSolicitud, cancelarSolicitud);

export default router;
