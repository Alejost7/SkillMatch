import { Router } from 'express';

import {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from './categorias.controller.js';

import {
    validarIdCategoria,
    validarCrearCategoria,
    validarActualizarCategoria
} from './categorias.validation.js';

import { autenticar, autorizarAdministrador } from '../../middlewares/autenticacion.js';

const router = Router();

// Rutas públicas: cualquiera puede consultar el catálogo.
router.get('/', listarCategorias);
router.get('/:id', validarIdCategoria, obtenerCategoria);

// Rutas protegidas: solo un administrador autenticado puede modificar el catálogo.
router.post(
    '/',
    autenticar,
    autorizarAdministrador,
    validarCrearCategoria,
    crearCategoria
);

router.put(
    '/:id',
    autenticar,
    autorizarAdministrador,
    validarIdCategoria,
    validarActualizarCategoria,
    actualizarCategoria
);

router.delete(
    '/:id',
    autenticar,
    autorizarAdministrador,
    validarIdCategoria,
    eliminarCategoria
);

export default router;