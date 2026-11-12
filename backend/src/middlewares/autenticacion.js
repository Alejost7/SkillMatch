// Middleware de autenticación basado en JSON Web Token (JWT).
// Su función es proteger rutas que solo pueden usar usuarios autenticados.

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { esAdministrador } from '../config/roles.js';

// Mensajes de error reutilizados para que las respuestas sean consistentes.
const MENSAJE_SIN_TOKEN = 'No se proporcionó un token de autenticación.';
const MENSAJE_FORMATO_INVALIDO =
    'El formato del token no es válido. Usa: Bearer <token>.';
const MENSAJE_TOKEN_INVALIDO = 'Token inválido o expirado.';

/**
 * Middleware que verifica si el cliente envió un token JWT válido.
 *
 * Flujo:
 * 1. El cliente envía el token en el header:
 *    Authorization: Bearer <token>
 * 2. Este middleware extrae y verifica el token.
 * 3. Si es válido, guarda los datos del usuario en req.usuario.
 * 4. Si no es válido, responde con 401 y no permite continuar.
 */
export function autenticar(req, res, next) {
    // Obtenemos el header Authorization.
    const header = req.headers.authorization;

    // Si no existe el header, el usuario no envió token.
    if (!header) {
        return res.status(401).json({
            success: false,
            message: MENSAJE_SIN_TOKEN
        });
    }

    // El formato esperado es: "Bearer token".
    const partes = header.split(' ');

    // Verificamos que tenga dos partes, que la primera sea "Bearer" y que el
    // token no esté vacío.
    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1].trim()) {
        return res.status(401).json({
            success: false,
            message: MENSAJE_FORMATO_INVALIDO
        });
    }

    // Extraemos el token.
    const token = partes[1];

    try {
        // Verificamos firma, expiración y algoritmo permitido.
        // Fijar el algoritmo evita que un token pueda declarar "alg: none".
        const payload = jwt.verify(token, env.jwt.secret, {
            algorithms: ['HS256']
        });

        // El token debe identificar a un usuario mediante un entero positivo.
        const idUsuario = Number(payload.idUsuario);

        if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
            return res.status(401).json({
                success: false,
                message: MENSAJE_TOKEN_INVALIDO
            });
        }

        // Guardamos la información del usuario autenticado en la petición.
        // Así, los controladores posteriores pueden saber qué usuario hace la petición.
        req.usuario = {
            idUsuario,
            idRol: payload.idRol ?? null,
            rol: payload.rol ?? null,
            correoElectronico: payload.correoElectronico ?? null
        };

        // Continuamos con el siguiente middleware o controlador.
        return next();
    } catch (error) {
        // Si el token es inválido, está manipulado o expiró, denegamos el acceso.
        return res.status(401).json({
            success: false,
            message: MENSAJE_TOKEN_INVALIDO
        });
    }
}

/**
 * Middleware para proteger rutas exclusivas de administrador.
 * Debe usarse después de autenticar.
 */
export function autorizarAdministrador(req, res, next) {
    // Verificamos que exista un usuario autenticado.
    if (!req.usuario) {
        return res.status(401).json({
            success: false,
            message: 'Debes iniciar sesión para acceder a este recurso.'
        });
    }

    // Se acepta el nombre del rol (preferido) o el identificador documentado.
    if (!esAdministrador(req.usuario)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción.'
        });
    }

    // Si el usuario es administrador, continuamos.
    return next();
}

// 401 Unauthorized: no se envia token o el token es inválido.
// 403 Forbidden: se envia token válido, pero no se tiene el rol necesario.
