// Rutas del módulo de usuarios.

import { Router } from 'express';

import {
    listarUsuarios,
    obtenerPerfil,
    obtenerUsuario,
    actualizarPerfil
} from './usuarios.controller.js';

import {
    validarIdUsuario,
    validarFiltrosUsuarios,
    validarActualizarPerfil
} from './usuarios.validation.js';

import { autenticar } from '../../middlewares/autenticacion.js';

const router = Router();

// Ruta protegida: consulta el perfil del usuario autenticado.
router.get('/perfil', autenticar, obtenerPerfil);

// Ruta protegida: actualiza el perfil del usuario autenticado.
router.put('/perfil', autenticar, validarActualizarPerfil, actualizarPerfil);

// Ruta pública: busca usuarios por nombre, ubicación o habilidades.
// GET /api/usuarios?nombre=ana&habilidadOfrecida=javascript&page=1&limit=10
router.get('/', validarFiltrosUsuarios, listarUsuarios);

// Ruta pública: consulta la información pública de un usuario.
router.get('/:id', validarIdUsuario, obtenerUsuario);

export default router;