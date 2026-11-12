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

// Ordenamientos permitidos para el listado.
// El valor ya viene validado desde la capa HTTP.
const ORDENAMIENTOS = {
    nombre: 'h.nombre ASC, h.id_habilidad ASC',
    recientes: 'h.id_habilidad DESC'
};

// Construye el WHERE de la búsqueda a partir de los filtros opcionales.
function crearFiltros({ idCategoria, nombre, estado } = {}) {
    const condiciones = [];
    const valores = [];

    if (idCategoria) {
        condiciones.push('h.id_categoria = ?');
        valores.push(idCategoria);
    }

    if (nombre) {
        // Búsqueda parcial: el texto puede aparecer en cualquier posición.
        condiciones.push('h.nombre LIKE ?');
        valores.push(`%${nombre}%`);
    }

    if (estado) {
        condiciones.push('h.estado = ?');
        valores.push(estado);
    }

    return {
        where: condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '',
        valores
    };
}

// Lista las habilidades que cumplen los filtros, con paginación.
// LIMIT y OFFSET se interpolan porque ya son enteros validados; mysql2 no
// admite marcadores preparados en esas cláusulas.
export async function buscar(
    filtros,
    { limite, desplazamiento, orden = 'nombre' }
) {
    const { where, valores } = crearFiltros(filtros);
    const ordenSql = ORDENAMIENTOS[orden] ?? ORDENAMIENTOS.nombre;

    const [rows] = await pool.execute(
        `${COLUMNAS}
        ${where}
        ORDER BY ${ordenSql}
        LIMIT ${limite} OFFSET ${desplazamiento}`,
        valores
    );

    return rows;
}

// Cuenta las habilidades que cumplen los filtros para calcular la paginación.
export async function contar(filtros) {
    const { where, valores } = crearFiltros(filtros);

    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total FROM habilidad h ${where}`,
        valores
    );

    return Number(rows[0]?.total ?? 0);
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