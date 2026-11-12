// Repositorio del módulo de mensajería.
// Los mensajes siempre pertenecen a una conexión aceptada entre dos usuarios.

import { pool } from '../../config/database.js';

// Consulta base de los mensajes.
// Se une con la conexión, la solicitud de origen y el remitente para poder
// filtrar por participante y devolver los datos públicos de quien escribe.
const COLUMNAS_MENSAJE = `
    SELECT
        m.id_mensaje,
        m.id_conexion,
        m.id_remitente,
        m.contenido,
        m.fecha_envio,
        m.leido,
        u.nombres AS remitente_nombres,
        u.apellidos AS remitente_apellidos,
        u.alias AS remitente_alias
    FROM mensaje m
    INNER JOIN conexion c ON c.id_conexion = m.id_conexion
    INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
    INNER JOIN usuario u ON u.id_usuario = m.id_remitente
`;

// Busca un mensaje por su identificador.
export async function findById(idMensaje) {
    const [rows] = await pool.execute(
        `${COLUMNAS_MENSAJE}
        WHERE m.id_mensaje = ?`,
        [idMensaje]
    );

    return rows[0] ?? null;
}

// Guarda un mensaje y devuelve la fila completa ya unida al remitente.
export async function create(idConexion, idRemitente, contenido) {
    const [result] = await pool.execute(
        `INSERT INTO mensaje (id_conexion, id_remitente, contenido)
        VALUES (?, ?, ?)`,
        [idConexion, idRemitente, contenido]
    );

    return findById(result.insertId);
}

// Construye el WHERE de los listados: el usuario debe ser participante de la
// conexión y, cuando se indica, el mensaje debe pertenecer a esa conexión.
function crearFiltros({ idUsuario, idConexion }) {
    const condiciones = [
        '(s.id_usuario_emisor = ? OR s.id_usuario_receptor = ?)'
    ];
    const valores = [idUsuario, idUsuario];

    if (idConexion) {
        condiciones.push('m.id_conexion = ?');
        valores.push(idConexion);
    }

    return { where: `WHERE ${condiciones.join(' AND ')}`, valores };
}

// Busca los mensajes visibles para el usuario con paginación.
// El orden es cronológico ascendente para que el cliente pinte la conversación
// tal como se lee. LIMIT y OFFSET llegan como enteros ya validados.
export async function buscar({
    idUsuario,
    idConexion,
    limite,
    desplazamiento
}) {
    const { where, valores } = crearFiltros({ idUsuario, idConexion });

    const [rows] = await pool.execute(
        `${COLUMNAS_MENSAJE}
        ${where}
        ORDER BY m.fecha_envio ASC, m.id_mensaje ASC
        LIMIT ${limite} OFFSET ${desplazamiento}`,
        valores
    );

    return rows;
}

// Cuenta los mensajes visibles para el usuario para calcular la paginación.
export async function contar({ idUsuario, idConexion }) {
    const { where, valores } = crearFiltros({ idUsuario, idConexion });

    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM mensaje m
        INNER JOIN conexion c ON c.id_conexion = m.id_conexion
        INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
        ${where}`,
        valores
    );

    return Number(rows[0]?.total ?? 0);
}

// Marca como leídos los mensajes que el usuario recibió en una conexión.
// Sus propios mensajes no se tocan: la marca significa "ya lo leí".
export async function marcarLeidos(idConexion, idUsuario) {
    const [result] = await pool.execute(
        `UPDATE mensaje
        SET leido = TRUE
        WHERE id_conexion = ? AND id_remitente <> ? AND leido = FALSE`,
        [idConexion, idUsuario]
    );

    return result.affectedRows;
}

// Resume los mensajes sin leer del usuario agrupados por conexión.
// Se usa para pintar la insignia de cada conversación en los listados.
export async function contarNoLeidos(idUsuario) {
    const [rows] = await pool.execute(
        `SELECT m.id_conexion, COUNT(*) AS total
        FROM mensaje m
        INNER JOIN conexion c ON c.id_conexion = m.id_conexion
        INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
        WHERE m.leido = FALSE
            AND m.id_remitente <> ?
            AND (s.id_usuario_emisor = ? OR s.id_usuario_receptor = ?)
        GROUP BY m.id_conexion
        ORDER BY m.id_conexion`,
        [idUsuario, idUsuario, idUsuario]
    );

    return rows;
}

// Cuenta los mensajes sin leer de una conexión concreta.
export async function contarNoLeidosDeConexion(idConexion, idUsuario) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM mensaje
        WHERE id_conexion = ? AND id_remitente <> ? AND leido = FALSE`,
        [idConexion, idUsuario]
    );

    return Number(rows[0]?.total ?? 0);
}
