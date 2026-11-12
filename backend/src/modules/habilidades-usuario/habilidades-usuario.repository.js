// Repositorio del módulo de habilidades del usuario.
// Aquí se ejecutan las consultas SQL de las tablas
// usuario_habilidad_ofrecida y usuario_habilidad_requerida.

import { pool } from '../../config/database.js';

// Consulta base de las habilidades ofrecidas.
// Se une con habilidad y categoría para devolver el nombre de la habilidad y
// su categoría sin que el cliente tenga que hacer consultas adicionales.
const COLUMNAS_OFRECIDAS = `
    SELECT
        o.id_habilidad_ofrecida,
        o.id_usuario,
        o.id_habilidad,
        h.nombre AS habilidad,
        h.id_categoria,
        c.nombre AS categoria,
        o.nivel,
        o.descripcion_apoyo,
        o.estado,
        o.fecha_registro
    FROM usuario_habilidad_ofrecida o
    INNER JOIN habilidad h ON h.id_habilidad = o.id_habilidad
    INNER JOIN categoria c ON c.id_categoria = h.id_categoria
`;

// Consulta base de las habilidades requeridas (las que el usuario quiere aprender).
const COLUMNAS_REQUERIDAS = `
    SELECT
        r.id_habilidad_requerida,
        r.id_usuario,
        r.id_habilidad,
        h.nombre AS habilidad,
        h.id_categoria,
        c.nombre AS categoria,
        r.nivel_deseado,
        r.objetivo_aprendizaje,
        r.estado,
        r.fecha_registro
    FROM usuario_habilidad_requerida r
    INNER JOIN habilidad h ON h.id_habilidad = r.id_habilidad
    INNER JOIN categoria c ON c.id_categoria = h.id_categoria
`;

// Lista las habilidades ofrecidas de un usuario.
export async function findOfrecidasByUsuario(idUsuario) {
    const [rows] = await pool.execute(
        `${COLUMNAS_OFRECIDAS}
        WHERE o.id_usuario = ?
        ORDER BY h.nombre ASC`,
        [idUsuario]
    );

    return rows;
}

// Busca una habilidad ofrecida del usuario por su identificador.
// El filtro por usuario impide consultar o modificar registros de otras personas.
export async function findOfrecidaById(idOfrecida, idUsuario) {
    const [rows] = await pool.execute(
        `${COLUMNAS_OFRECIDAS}
        WHERE o.id_habilidad_ofrecida = ? AND o.id_usuario = ?`,
        [idOfrecida, idUsuario]
    );

    return rows[0] ?? null;
}

// Registra una habilidad ofrecida por el usuario.
export async function createOfrecida(
    idUsuario,
    { idHabilidad, nivel, descripcionApoyo, estado }
) {
    const [result] = await pool.execute(
        `INSERT INTO usuario_habilidad_ofrecida
        (id_usuario, id_habilidad, nivel, descripcion_apoyo, estado)
        VALUES (?, ?, ?, ?, ?)`,
        [idUsuario, idHabilidad, nivel, descripcionApoyo ?? null, estado]
    );

    return findOfrecidaById(result.insertId, idUsuario);
}

// Actualiza una habilidad ofrecida del usuario.
export async function updateOfrecida(
    idOfrecida,
    idUsuario,
    { idHabilidad, nivel, descripcionApoyo, estado }
) {
    await pool.execute(
        `UPDATE usuario_habilidad_ofrecida
        SET id_habilidad = ?, nivel = ?, descripcion_apoyo = ?, estado = ?
        WHERE id_habilidad_ofrecida = ? AND id_usuario = ?`,
        [
            idHabilidad,
            nivel,
            descripcionApoyo ?? null,
            estado,
            idOfrecida,
            idUsuario
        ]
    );

    return findOfrecidaById(idOfrecida, idUsuario);
}

// Elimina físicamente una habilidad ofrecida del usuario.
export async function removeOfrecida(idOfrecida, idUsuario) {
    const [result] = await pool.execute(
        `DELETE FROM usuario_habilidad_ofrecida
        WHERE id_habilidad_ofrecida = ? AND id_usuario = ?`,
        [idOfrecida, idUsuario]
    );

    return result.affectedRows > 0;
}

// Lista las habilidades requeridas (que desea aprender) de un usuario.
export async function findRequeridasByUsuario(idUsuario) {
    const [rows] = await pool.execute(
        `${COLUMNAS_REQUERIDAS}
        WHERE r.id_usuario = ?
        ORDER BY h.nombre ASC`,
        [idUsuario]
    );

    return rows;
}

// Busca una habilidad requerida del usuario por su identificador.
export async function findRequeridaById(idRequerida, idUsuario) {
    const [rows] = await pool.execute(
        `${COLUMNAS_REQUERIDAS}
        WHERE r.id_habilidad_requerida = ? AND r.id_usuario = ?`,
        [idRequerida, idUsuario]
    );

    return rows[0] ?? null;
}

// Registra una habilidad que el usuario desea aprender.
export async function createRequerida(
    idUsuario,
    { idHabilidad, nivelDeseado, objetivoAprendizaje, estado }
) {
    const [result] = await pool.execute(
        `INSERT INTO usuario_habilidad_requerida
        (id_usuario, id_habilidad, nivel_deseado, objetivo_aprendizaje, estado)
        VALUES (?, ?, ?, ?, ?)`,
        [
            idUsuario,
            idHabilidad,
            nivelDeseado ?? null,
            objetivoAprendizaje ?? null,
            estado
        ]
    );

    return findRequeridaById(result.insertId, idUsuario);
}

// Actualiza una habilidad requerida del usuario.
export async function updateRequerida(
    idRequerida,
    idUsuario,
    { idHabilidad, nivelDeseado, objetivoAprendizaje, estado }
) {
    await pool.execute(
        `UPDATE usuario_habilidad_requerida
        SET id_habilidad = ?, nivel_deseado = ?, objetivo_aprendizaje = ?, estado = ?
        WHERE id_habilidad_requerida = ? AND id_usuario = ?`,
        [
            idHabilidad,
            nivelDeseado ?? null,
            objetivoAprendizaje ?? null,
            estado,
            idRequerida,
            idUsuario
        ]
    );

    return findRequeridaById(idRequerida, idUsuario);
}

// Elimina físicamente una habilidad requerida del usuario.
export async function removeRequerida(idRequerida, idUsuario) {
    const [result] = await pool.execute(
        `DELETE FROM usuario_habilidad_requerida
        WHERE id_habilidad_requerida = ? AND id_usuario = ?`,
        [idRequerida, idUsuario]
    );

    return result.affectedRows > 0;
}
