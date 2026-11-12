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

// Responde 401 con el mensaje indicado.
function responderNoAutorizado(res, message) {
    return res.status(401).json({ success: false, message });
}

/**
 * Verifica un token JWT y devuelve su contenido, o null si no es utilizable.
 *
 * Se expone para poder verificar el token en contextos donde no hay header
 * Authorization (por ejemplo, el parámetro ?token= de SSE).
 */
export function verificarToken(token) {
    try {
        // Verificamos firma, expiración y algoritmo permitido.
        // Fijar el algoritmo evita que un token pueda declarar "alg: none".
        const payload = jwt.verify(token, env.jwt.secret, {
            algorithms: ['HS256']
        });

        // El token debe identificar a un usuario mediante un entero positivo.
        const idUsuario = Number(payload.idUsuario);

        if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
            return null;
        }

        return payload;
    } catch {
        // Token inválido, manipulado o expirado.
        return null;
    }
}

/**
 * Completa la autenticación a partir de un token ya extraído.
 * Guarda el usuario en req.usuario y continúa la cadena de middlewares.
 */
function iniciarSesion(req, res, next, token) {
    const payload = verificarToken(token);

    if (!payload) {
        return responderNoAutorizado(res, MENSAJE_TOKEN_INVALIDO);
    }

    // Guardamos la información del usuario autenticado en la petición.
    // Así, los controladores posteriores pueden saber qué usuario hace la petición.
    req.usuario = {
        idUsuario: Number(payload.idUsuario),
        idRol: payload.idRol ?? null,
        rol: payload.rol ?? null,
        correoElectronico: payload.correoElectronico ?? null
    };

    // Continuamos con el siguiente middleware o controlador.
    return next();
}

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
        return responderNoAutorizado(res, MENSAJE_SIN_TOKEN);
    }

    // El formato esperado es: "Bearer token".
    const partes = header.split(' ');

    // Verificamos que tenga dos partes, que la primera sea "Bearer" y que el
    // token no esté vacío.
    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1].trim()) {
        return responderNoAutorizado(res, MENSAJE_FORMATO_INVALIDO);
    }

    return iniciarSesion(req, res, next, partes[1]);
}

/**
 * Autenticación para EventSource (SSE).
 *
 * El navegador crea EventSource sin poder enviar headers, así que el token
 * viaja como parámetro de consulta: GET /api/eventos?token=<jwt>.
 * Las comprobaciones son exactamente las mismas que en autenticar().
 *
 * Advertencia: los parámetros de consulta quedan en los logs de acceso. Se
 * acepta solo por ser el único mecanismo de EventSource; la cookie httpOnly o
 * un token de vida corta son la alternativa si el proyecto la adopta.
 */
export function autenticarEvento(req, res, next) {
    const valor = req.query?.token;
    const token = typeof valor === 'string' ? valor.trim() : '';

    // typeof descarta arrays (por ejemplo ?token=a&token=b).
    if (!token) {
        return responderNoAutorizado(res, MENSAJE_SIN_TOKEN);
    }

    return iniciarSesion(req, res, next, token);
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
