import { pool } from '../../config/database.js';

export async function findAll() {
    const [rows] = await pool.execute(`
        SELECT
        id_categoria,
        nombre,
        descripcion,
        estado,
        fecha_creacion
        FROM categoria
        ORDER BY nombre ASC
    `);

    return rows;
}

export async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT
        id_categoria,
        nombre,
        descripcion,
        estado,
        fecha_creacion
        FROM categoria
        WHERE id_categoria = ?`,
        [id]
    );

    return rows[0] ?? null;
}

export async function create({ nombre, descripcion, estado }) {
    const [result] = await pool.execute(
        `INSERT INTO categoria (nombre, descripcion, estado)
        VALUES (?, ?, ?)`,
        [nombre, descripcion, estado]
    );

    return findById(result.insertId);
}

export async function update(id, { nombre, descripcion, estado }) {
    await pool.execute(
        `UPDATE categoria
        SET nombre = ?, descripcion = ?, estado = ?
        WHERE id_categoria = ?`,
        [nombre, descripcion, estado, id]
    );

    return findById(id);
}

export async function remove(id) {
    const [result] = await pool.execute(
        'DELETE FROM categoria WHERE id_categoria = ?',
        [id]
    );

    return result.affectedRows > 0;
}