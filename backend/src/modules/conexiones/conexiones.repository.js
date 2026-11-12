// Repositorio del módulo de conexiones.
// Una conexión nace cuando el receptor de una solicitud la acepta y relaciona
// a las dos personas participantes.

import { pool } from '../../config/database.js';

// Consulta base de las conexiones.
// Se une con la solicitud de origen para conocer a los participantes y el
// mensaje con el que se inició el intercambio.
const COLUMNAS_CONEXION = `
    SELECT
        c.id_conexion,
        c.id_solicitud,
        c.fecha_inicio,
        c.estado_conexion,
        s.id_usuario_emisor,
        s.id_usuario_receptor,
        s.mensaje_inicial,
        e.nombres AS emisor_nombres,
        e.apellidos AS emisor_apellidos,
        e.alias AS emisor_alias,
        r.nombres AS receptor_nombres,
        r.apellidos AS receptor_apellidos,
        r.alias AS receptor_alias
    FROM conexion c
    INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
    INNER JOIN usuario e ON e.id_usuario = s.id_usuario_emisor
    INNER JOIN usuario r ON r.id_usuario = s.id_usuario_receptor
`;

// Busca una conexión por su identificador.
export async function findById(idConexion) {
    const [rows] = await pool.execute(
        `${COLUMNAS_CONEXION}
        WHERE c.id_conexion = ?`,
        [idConexion]
    );

    return rows[0] ?? null;
}

// Construye el WHERE de los listados: el usuario debe ser participante.
function crearFiltros({ idUsuario, estado }) {
    const condiciones = [
        '(s.id_usuario_emisor = ? OR s.id_usuario_receptor = ?)'
    ];
    const valores = [idUsuario, idUsuario];

    if (estado) {
        condiciones.push('c.estado_conexion = ?');
        valores.push(estado);
    }

    return { where: `WHERE ${condiciones.join(' AND ')}`, valores };
}

// Busca las conexiones de un usuario con paginación.
// LIMIT y OFFSET se interpolan porque ya son enteros validados; mysql2 no
// admite marcadores preparados en esas cláusulas.
export async function buscar({
    idUsuario,
    estado,
    limite,
    desplazamiento
}) {
    const { where, valores } = crearFiltros({ idUsuario, estado });

    const [rows] = await pool.execute(
        `${COLUMNAS_CONEXION}
        ${where}
        ORDER BY c.fecha_inicio DESC, c.id_conexion DESC
        LIMIT ${limite} OFFSET ${desplazamiento}`,
        valores
    );

    return rows;
}

// Cuenta las conexiones de un usuario para calcular la paginación.
export async function contar({ idUsuario, estado }) {
    const { where, valores } = crearFiltros({ idUsuario, estado });

    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM conexion c
        INNER JOIN solicitud_conexion s ON s.id_solicitud = c.id_solicitud
        ${where}`,
        valores
    );

    return Number(rows[0]?.total ?? 0);
}

// Cambia el estado de una conexión que sigue activa.
// Devuelve true cuando la fila se actualizó.
export async function updateEstado(idConexion, estadoConexion) {
    const [result] = await pool.execute(
        `UPDATE conexion
        SET estado_conexion = ?
        WHERE id_conexion = ? AND estado_conexion = 'activa'`,
        [estadoConexion, idConexion]
    );

    return result.affectedRows > 0;
}
