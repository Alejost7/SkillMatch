// Repositorio del módulo de habilidades.
// Aquí se ejecutan las consultas SQL hacia MySQL.

import { pool } from '../../config/database.js';

// Consulta base para evitar repetir las mismas columnas en varias consultas.
const COLUMNAS = `
    SELECT
        h.id_habilidad,
        h.id_categoria,
        c.nombre AS categoria,
        h.nombre,
        h.descripcion,
        h.estado
    FROM habilidad h
    INNER JOIN categoria c ON c.id_categoria = h.id_categoria
`;

// Lista todas las habilidades, opcionalmente filtradas por categoría.
export async function findAll(idCategoria = null) {
    if (idCategoria) {
        const [rows] = await pool.execute(
        `${COLUMNAS}
        WHERE h.id_categoria = ?
        ORDER BY h.nombre ASC`,
        [idCategoria]
        );

        return rows;
    }

    const [rows] = await pool.execute(
        `${COLUMNAS}
        ORDER BY h.nombre ASC`
    );

    return rows;
}

// Busca una habilidad por su identificador.
export async function findById(id) {
    const [rows] = await pool.execute(
        `${COLUMNAS}
        WHERE h.id_habilidad = ?`,
        [id]
    );

    return rows[0] ?? null;
}

// Crea una nueva habilidad.
export async function create({ idCategoria, nombre, descripcion, estado }) {
    const [result] = await pool.execute(
        `INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
        VALUES (?, ?, ?, ?)`,
        [idCategoria, nombre, descripcion, estado]
    );

    return findById(result.insertId);
}

// Actualiza una habilidad existente.
export async function update(id, { idCategoria, nombre, descripcion, estado }) {
    await pool.execute(
        `UPDATE habilidad
        SET id_categoria = ?, nombre = ?, descripcion = ?, estado = ?
        WHERE id_habilidad = ?`,
        [idCategoria, nombre, descripcion, estado, id]
    );

    return findById(id);
}

// Elimina físicamente una habilidad.
export async function remove(id) {
    const [result] = await pool.execute(
        'DELETE FROM habilidad WHERE id_habilidad = ?',
        [id]
    );

  return result.affectedRows > 0;
}