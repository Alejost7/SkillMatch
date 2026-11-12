// Rutas del módulo de mensajería.
// Todas las rutas son privadas: el usuario se identifica con el token y solo
// puede leer y escribir en las conexiones en las que participa.

import { Router } from 'express';

import {
    listarMensajes,
    obtenerResumenNoLeidos,
    enviarMensaje,
    marcarLeidos
} from './mensajes.controller.js';

import {
    validarFiltrosMensajes,
    validarCrearMensaje,
    validarMarcarLeidos
} from './mensajes.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas.
router.use(autenticar);

// GET /api/mensajes/no-leidos
router.get('/no-leidos', obtenerResumenNoLeidos);

// GET /api/mensajes?conexionId=1&page=1&limit=10
router.get('/', validarFiltrosMensajes, listarMensajes);

// POST /api/mensajes
router.post('/', validarCrearMensaje, enviarMensaje);

// PATCH /api/mensajes/leidos
router.patch('/leidos', validarMarcarLeidos, marcarLeidos);

export default router;
