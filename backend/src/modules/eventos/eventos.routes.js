// Rutas del módulo de eventos (SSE).
// El token viaja en la query string porque EventSource no permite headers.

import { Router } from 'express';

import { abrirEventos, obtenerFeed } from './eventos.controller.js';
import {
    autenticar,
    autenticarEvento
} from '../../middlewares/autenticacion.js';

const router = Router();

// GET /api/eventos/feed
// Es una consulta REST normal: el cliente la hace con apiClient, que envía el
// token en el header Authorization.
router.get('/feed', autenticar, obtenerFeed);

// GET /api/eventos?token=<jwt>
// EventSource no permite headers, así que aquí sí se lee el token de la query.
router.get('/', autenticarEvento, abrirEventos);

export default router;

