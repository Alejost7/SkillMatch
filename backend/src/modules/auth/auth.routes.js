// Rutas de autenticación.

import { Router } from 'express';

import { registrar, login } from './auth.controller.js';
import { validarRegistro, validarLogin } from './auth.validation.js';

const router = Router();

// POST /api/auth/registro
router.post('/registro', validarRegistro, registrar);

// POST /api/auth/login
router.post('/login', validarLogin, login);

export default router;