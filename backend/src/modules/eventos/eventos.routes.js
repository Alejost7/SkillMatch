// Rutas del módulo de eventos (SSE).
// El token viaja en la query string porque EventSource no permite headers.

import { Router } from 'express';

import { abrirEventos, obtenerFeed } from './eventos.controller.js';
import { autenticarEvento } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas.
router.use(autenticarEvento);

// GET /api/eventos/feed
router.get('/feed', obtenerFeed);

// GET /api/eventos?token=<jwt>
router.get('/', abrirEventos);

export default router;
