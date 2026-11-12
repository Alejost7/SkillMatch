// Repositorio del módulo de calificaciones.
// Una calificación pertenece a una conexión finalizada y siempre va de un
// participante al otro; la tabla impide duplicados con una clave única.

import { pool } from '../../config/database.js';

// Consulta base de las calificaciones con los datos públicos de las dos partes.
const COLUMNAS_CALIFICACION = `
    SELECT
        k.id_calificacion,
        k.id_conexion,
        k.id_calificador,
        k.id_calificado,
        k.puntuacion,
        k.comentario,
        k.fecha_calificacion,
        c.nombres AS calificador_nombres,
        c.apellidos AS calificador_apellidos,
        c.alias AS calificador_alias,
        d.nombres AS calificado_nombres,
        d.apellidos AS calificado_apellidos,
        d.alias AS calificado_alias
    FROM calificacion k
    INNER JOIN usuario c ON c.id_usuario = k.id_calificador
    INNER JOIN usuario d ON d.id_usuario = k.id_calificado
`;

// Busca una calificación por su identificador.
export async function findById(idCalificacion) {
    const [rows] = await pool.execute(
        `${COLUMNAS_CALIFICACION}
        WHERE k.id_calificacion = ?`,
        [idCalificacion]
    );

    return rows[0] ?? null;
}

// Busca la calificación que un participante ya hizo sobre el otro en la misma
// conexión. La clave única (conexión, calificador, calificado) la respalda.
export async function findEntreConexion(idConexion, idCalificador, idCalificado) {
    const [rows] = await pool.execute(
        `${COLUMNAS_CALIFICACION}
        WHERE k.id_conexion = ?
            AND k.id_calificador = ?
            AND k.id_calificado = ?`,
        [idConexion, idCalificador, idCalificado]
    );

    return rows[0] ?? null;
}

// Guarda una calificación y devuelve la fila completa ya unida a los usuarios.
export async function create({
    idConexion,
    idCalificador,
    idCalificado,
    puntuacion,
    comentario
}) {
    const [result] = await pool.execute(
        `INSERT INTO calificacion
            (id_conexion, id_calificador, id_calificado, puntuacion, comentario)
        VALUES (?, ?, ?, ?, ?)`,
        [
            idConexion,
            idCalificador,
            idCalificado,
            puntuacion,
            comentario ?? null
        ]
    );

    return findById(result.insertId);
}

// Busca las calificaciones recibidas por un usuario con paginación.
// LIMIT y OFFSET se interpolan porque ya son enteros validados; mysql2 no
// admite marcadores preparados en esas cláusulas.
export async function buscarRecibidas({
    idCalificado,
    limite,
    desplazamiento
}) {
    const [rows] = await pool.execute(
        `${COLUMNAS_CALIFICACION}
        WHERE k.id_calificado = ?
        ORDER BY k.fecha_calificacion DESC, k.id_calificacion DESC
        LIMIT ${limite} OFFSET ${desplazamiento}`,
        [idCalificado]
    );

    return rows;
}

// Cuenta las calificaciones recibidas por un usuario.
export async function contarRecibidas(idCalificado) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
        FROM calificacion
        WHERE id_calificado = ?`,
        [idCalificado]
    );

    return Number(rows[0]?.total ?? 0);
}

// Busca las calificaciones de una conexión concreta.
// Son como máximo dos: una por cada participante.
export async function buscarPorConexion(idConexion) {
    const [rows] = await pool.execute(
        `${COLUMNAS_CALIFICACION}
        WHERE k.id_conexion = ?
        ORDER BY k.fecha_calificacion ASC, k.id_calificacion ASC`,
        [idConexion]
    );

    return rows;
}

// Agrupa las calificaciones recibidas por puntuación.
// Con esas filas el servicio calcula el total, el promedio y la distribución.
export async function resumenPorUsuario(idCalificado) {
    const [rows] = await pool.execute(
        `SELECT puntuacion, COUNT(*) AS total
        FROM calificacion
        WHERE id_calificado = ?
        GROUP BY puntuacion
        ORDER BY puntuacion`,
        [idCalificado]
    );

    return rows;
}
