// Repositorio del feed derivado de notificaciones.
//
// No existe una tabla "notificacion": el feed se calcula con datos que ya
// están en la base (solicitudes pendientes, mensajes sin leer y conexiones
// finalizadas sin calificar). Así no hay estados duplicados ni riesgo de
// notificaciones huérfanas.

import { pool } from '../../config/database.js';

// Cantidad de elementos que se devuelven por bloque del feed.
const LIMITE_FEED = 5;

// Nombre visible del otro participante de una conexión.
const INTERLOCUTOR = `
    CASE
        WHEN s.id_usuario_emisor = ? THEN s.id_usuario_receptor
        ELSE s.id_usuario_emisor
    END
`;

// Solicitudes pendientes recibidas por el usuario.
export async function buscarSolicitudesPendientes(idUsuario) {
    const [rows] = await pool.execute(
        `SELECT
            s.id_solicitud,
            s.id_usuario_emisor,
            s.mensaje_inicial,
            s.fecha_envio,
            u.nombres,
            u.apellidos,
            u.alias
        FROM solicitud_conexion s
        INNER JOIN usuario u ON u.id_usuario = s.id_usuario_emisor
        WHERE s.id_usuario_receptor = ?
            AND s.estado_solicitud = 'pendiente'
        ORDER BY s.fecha_envio DESC, s.id_solicitud DESC
        LIMIT ${LIMITE_FEED}`,
        [idUsuario]
    );

    return rows;
}

// Total de solicitudes pendientes recibidas (para la insignia).
export async function contarSolicitudesPendientes(idUsuario) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM solicitud_conexion
        WHERE id_usuario_receptor = ? AND estado_solicitud = 'pendiente'`,
        [idUsuario]
    );

    return Number(rows[0]?.total ?? 0);
}

// Conexiones finalizadas en las que el usuario todavía no calificó.
export async function buscarPendientesDeCalificar(idUsuario) {
    const [rows] = await pool.execute(
        `SELECT
            c.id_conexion,
            c.fecha_inicio,
            otro.id_usuario,
            otro.nombres,
            otro.apellidos,
            otro.alias
        FROM conexion c
        INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
        INNER JOIN usuario otro
            ON otro.id_usuario = (${INTERLOCUTOR})
        WHERE c.estado_conexion = 'finalizada'
            AND (s.id_usuario_emisor = ? OR s.id_usuario_receptor = ?)
            AND NOT EXISTS (
                SELECT 1
                FROM calificacion cal
                WHERE cal.id_conexion = c.id_conexion
                    AND cal.id_calificador = ?
            )
        ORDER BY c.fecha_inicio DESC, c.id_conexion DESC
        LIMIT ${LIMITE_FEED}`,
        [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    return rows;
}

// Total de intercambios finalizados que esperan la calificación del usuario.
export async function contarPendientesDeCalificar(idUsuario) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM conexion c
        INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
        WHERE c.estado_conexion = 'finalizada'
            AND (s.id_usuario_emisor = ? OR s.id_usuario_receptor = ?)
            AND NOT EXISTS (
                SELECT 1
                FROM calificacion cal
                WHERE cal.id_conexion = c.id_conexion
                    AND cal.id_calificador = ?
            )`,
        [idUsuario, idUsuario, idUsuario]
    );

    return Number(rows[0]?.total ?? 0);
}
