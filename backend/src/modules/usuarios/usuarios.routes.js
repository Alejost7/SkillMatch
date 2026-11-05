// Rutas del módulo de usuarios.

import { Router } from 'express';

import {
    obtenerPerfil,
    obtenerUsuario,
    actualizarPerfil
} from './usuarios.controller.js';

import {
    validarIdUsuario,
    validarActualizarPerfil
} from './usuarios.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Ruta protegida: consulta el perfil del usuario autenticado.
router.get('/perfil', autenticar, obtenerPerfil);

// Ruta protegida: actualiza el perfil del usuario autenticado.
router.put('/perfil', autenticar, validarActualizarPerfil, actualizarPerfil);

// Ruta pública: consulta la información pública de un usuario.
router.get('/:id', validarIdUsuario, obtenerUsuario);

export default router;