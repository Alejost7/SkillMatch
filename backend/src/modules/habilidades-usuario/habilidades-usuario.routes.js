// Rutas del módulo de habilidades del usuario.
// Cada usuario administra únicamente sus propias habilidades ofrecidas y
// requeridas, por eso todas las rutas exigen un token válido.

import { Router } from 'express';

import {
    listarOfrecidas,
    registrarOfrecida,
    actualizarOfrecida,
    eliminarOfrecida,
    listarRequeridas,
    registrarRequerida,
    actualizarRequerida,
    eliminarRequerida
} from './habilidades-usuario.controller.js';

import {
    validarIdOfrecida,
    validarIdRequerida,
    validarCrearOfrecida,
    validarActualizarOfrecida,
    validarCrearRequerida,
    validarActualizarRequerida
} from './habilidades-usuario.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Todas las rutas del módulo son privadas: el usuario se identifica con el JWT.
router.use(autenticar);

// Habilidades que el usuario ofrece.

// GET /api/habilidades-usuario/ofrecidas
router.get('/ofrecidas', listarOfrecidas);

// POST /api/habilidades-usuario/ofrecidas
router.post('/ofrecidas', validarCrearOfrecida, registrarOfrecida);

// PUT /api/habilidades-usuario/ofrecidas/:id
router.put(
    '/ofrecidas/:id',
    validarIdOfrecida,
    validarActualizarOfrecida,
    actualizarOfrecida
);

// DELETE /api/habilidades-usuario/ofrecidas/:id
router.delete('/ofrecidas/:id', validarIdOfrecida, eliminarOfrecida);

// Habilidades que el usuario desea aprender.

// GET /api/habilidades-usuario/requeridas
router.get('/requeridas', listarRequeridas);

// POST /api/habilidades-usuario/requeridas
router.post('/requeridas', validarCrearRequerida, registrarRequerida);

// PUT /api/habilidades-usuario/requeridas/:id
router.put(
    '/requeridas/:id',
    validarIdRequerida,
    validarActualizarRequerida,
    actualizarRequerida
);

// DELETE /api/habilidades-usuario/requeridas/:id
router.delete('/requeridas/:id', validarIdRequerida, eliminarRequerida);

export default router;
