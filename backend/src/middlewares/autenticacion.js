// Middleware de autenticación basado en JSON Web Token (JWT).
// Su función es proteger rutas que solo pueden usar usuarios autenticados.

import jwt from 'jsonwebtoken';

// Cargamos las variables de entorno.
import 'dotenv/config';

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
        message: 'No se proporcionó un token de autenticación.'
        });
    }

    // El formato esperado es: "Bearer token".
    // Por eso separamos el texto por espacios.
    const partes = header.split(' ');

    // Verificamos que tenga dos partes y que la primera sea "Bearer".
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
        success: false,
        message: 'El formato del token no es válido. Usa: Bearer <token>.'
        });
    }

    // Extraemos el token.
    const token = partes[1];

    try {
        // Verificamos que el token sea válido y no haya expirado.
        // jwt.verify lanza un error si el token es inválido o está expirado.
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos la información del usuario autenticado en la petición.
        // Así, los controladores posteriores pueden saber qué usuario hace la petición.
        req.usuario = {
        idUsuario: payload.idUsuario,
        idRol: payload.idRol,
        correoElectronico: payload.correoElectronico
        };

        // Continuamos con el siguiente middleware o controlador.
        next();
    } catch (error) {
        // Si el token es inválido, está manipulado o expiró, denegamos el acceso.
        return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado.'
        });
    }
}

/**
 * Middleware opcional para proteger rutas exclusivas de administrador.
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

    // El rol 1 corresponde a administrador según los datos iniciales.
    if (req.usuario.idRol !== 1) {
        return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción.'
        });
    }

    // Si el usuario es administrador, continuamos.
    next();
}

// 401 Unauthorized: no se envia token o el token es inválido.
// 403 Forbidden: se envia token válido, pero no se tiene el rol necesario.