// Repositorio del módulo de solicitudes de conexión.
// Aquí se ejecutan las consultas SQL de la tabla solicitud_conexion y la
// creación de la conexión cuando una solicitud es aceptada.

import { pool } from '../../config/database.js';

// Consulta base de las solicitudes.
// Se unen emisor y receptor para devolver los datos públicos de ambos sin
// consultas adicionales.
const COLUMNAS_SOLICITUD = `
    SELECT
        s.id_solicitud,
        s.id_usuario_emisor,
        s.id_usuario_receptor,
        s.mensaje_inicial,
        s.fecha_envio,
        s.estado_solicitud,
        s.fecha_respuesta,
        e.nombres AS emisor_nombres,
        e.apellidos AS emisor_apellidos,
        e.alias AS emisor_alias,
        r.nombres AS receptor_nombres,
        r.apellidos AS receptor_apellidos,
        r.alias AS receptor_alias
    FROM solicitud_conexion s
    INNER JOIN usuario e ON e.id_usuario = s.id_usuario_emisor
    INNER JOIN usuario r ON r.id_usuario = s.id_usuario_receptor
`;

// Busca una solicitud por su identificador.
export async function findById(idSolicitud) {
    const [rows] = await pool.execute(
        `${COLUMNAS_SOLICITUD}
        WHERE s.id_solicitud = ?`,
        [idSolicitud]
    );

    return rows[0] ?? null;
}

// Busca una solicitud pendiente entre dos usuarios, sin importar quién la envió.
// Se usa para impedir solicitudes duplicadas en ambos sentidos.
export async function findPendienteEntreUsuarios(idUsuarioA, idUsuarioB) {
    const [rows] = await pool.execute(
        `SELECT id_solicitud
        FROM solicitud_conexion
        WHERE estado_solicitud = 'pendiente'
            AND (
                (id_usuario_emisor = ? AND id_usuario_receptor = ?)
                OR (id_usuario_emisor = ? AND id_usuario_receptor = ?)
            )
        LIMIT 1`,
        [idUsuarioA, idUsuarioB, idUsuarioB, idUsuarioA]
    );

    return rows[0] ?? null;
}

// Busca una conexión activa entre dos usuarios.
// Una conexión activa implica que ya se aceptó una solicitud y que ambas
// personas pueden comunicarse.
export async function findConexionActivaEntreUsuarios(idUsuarioA, idUsuarioB) {
    const [rows] = await pool.execute(
        `SELECT c.id_conexion
        FROM conexion c
        INNER JOIN solicitud_conexion s
            ON s.id_solicitud = c.id_solicitud
        WHERE c.estado_conexion = 'activa'
            AND (
                (s.id_usuario_emisor = ? AND s.id_usuario_receptor = ?)
                OR (s.id_usuario_emisor = ? AND s.id_usuario_receptor = ?)
            )
        LIMIT 1`,
        [idUsuarioA, idUsuarioB, idUsuarioB, idUsuarioA]
    );

    return rows[0] ?? null;
}

// Construye el WHERE de los listados de solicitudes.
// direccion vale 'recibidas' (el usuario es receptor) o 'enviadas'
// (el usuario es emisor).
function crearFiltros({ idUsuario, direccion, estado }) {
    const condiciones = [];
    const valores = [];

    if (direccion === 'recibidas') {
        condiciones.push('s.id_usuario_receptor = ?');
    } else {
        condiciones.push('s.id_usuario_emisor = ?');
    }

    valores.push(idUsuario);

    if (estado) {
        condiciones.push('s.estado_solicitud = ?');
        valores.push(estado);
    }

    return { where: `WHERE ${condiciones.join(' AND ')}`, valores };
}

// Busca las solicitudes de un usuario con paginación.
// LIMIT y OFFSET se interpolan porque ya son enteros validados; mysql2 no
// admite marcadores preparados en esas cláusulas.
export async function buscar({
    idUsuario,
    direccion,
    estado,
    limite,
    desplazamiento
}) {
    const { where, valores } = crearFiltros({ idUsuario, direccion, estado });

    const [rows] = await pool.execute(
        `${COLUMNAS_SOLICITUD}
        ${where}
        ORDER BY s.fecha_envio DESC, s.id_solicitud DESC
        LIMIT ${limite} OFFSET ${desplazamiento}`,
        valores
    );

    return rows;
}

// Cuenta las solicitudes de un usuario para calcular la paginación.
export async function contar({ idUsuario, direccion, estado }) {
    const { where, valores } = crearFiltros({ idUsuario, direccion, estado });

    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM solicitud_conexion s
        ${where}`,
        valores
    );

    return Number(rows[0]?.total ?? 0);
}

// Registra una nueva solicitud pendiente.
// La fecha de envío y el estado los asigna la base de datos.
export async function create(
    idUsuarioEmisor,
    { idUsuarioReceptor, mensajeInicial }
) {
    const [result] = await pool.execute(
        `INSERT INTO solicitud_conexion
        (id_usuario_emisor, id_usuario_receptor, mensaje_inicial)
        VALUES (?, ?, ?)`,
        [idUsuarioEmisor, idUsuarioReceptor, mensajeInicial ?? null]
    );

    return findById(result.insertId);
}

// Responde una solicitud pendiente (rechazada o cancelada).
// Devuelve true cuando la fila se actualizó; false cuando la solicitud ya
// había sido respondida por otra petición.
export async function responder(idSolicitud, estadoSolicitud) {
    const [result] = await pool.execute(
        `UPDATE solicitud_conexion
        SET estado_solicitud = ?, fecha_respuesta = CURRENT_TIMESTAMP
        WHERE id_solicitud = ? AND estado_solicitud = 'pendiente'`,
        [estadoSolicitud, idSolicitud]
    );

    return result.affectedRows > 0;
}

// Acepta una solicitud y crea su conexión en una sola transacción.
// El UPDATE exige que la solicitud siga pendiente, así dos peticiones
// simultáneas no pueden crear dos conexiones para la misma solicitud.
// Devuelve el identificador de la conexión creada o null si la solicitud ya
// había sido respondida.
export async function aceptar(idSolicitud) {
    const bd = await pool.getConnection();

    try {
        await bd.beginTransaction();

        const [result] = await bd.execute(
            `UPDATE solicitud_conexion
            SET estado_solicitud = 'aceptada',
                fecha_respuesta = CURRENT_TIMESTAMP
            WHERE id_solicitud = ? AND estado_solicitud = 'pendiente'`,
            [idSolicitud]
        );

        if (result.affectedRows === 0) {
            await bd.rollback();
            return null;
        }

        // La tabla conexion tiene una restricción única sobre id_solicitud.
        const [insert] = await bd.execute(
            `INSERT INTO conexion (id_solicitud) VALUES (?)`,
            [idSolicitud]
        );

        await bd.commit();

        return { idConexion: insert.insertId };
    } catch (error) {
        await bd.rollback();
        throw error;
    } finally {
        bd.release();
    }
}
