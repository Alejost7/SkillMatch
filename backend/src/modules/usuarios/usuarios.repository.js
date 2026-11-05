// Repositorio del módulo de usuarios.
// Contiene las consultas SQL relacionadas con la tabla usuario.

import { pool } from '../../config/database.js';

// Busca un usuario por correo electrónico.
export async function findByCorreo(correoElectronico) {
    const [rows] = await pool.execute(
        `SELECT
        id_usuario,
        id_rol,
        nombres,
        apellidos,
        correo_electronico,
        contrasena_hash,
        alias,
        estado_cuenta
        FROM usuario
        WHERE correo_electronico = ?`,
        [correoElectronico]
    );

    return rows[0] ?? null;
}

// Busca un usuario por alias.
export async function findByAlias(alias) {
    const [rows] = await pool.execute(
        `SELECT
        id_usuario,
        alias
        FROM usuario
        WHERE alias = ?`,
        [alias]
    );

    return rows[0] ?? null;
}

// Busca un usuario por identificador.
export async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT
        u.id_usuario,
        u.id_rol,
        r.nombre AS rol,
        u.nombres,
        u.apellidos,
        u.correo_electronico,
        u.alias,
        u.estado_cuenta,
        u.fecha_registro,
        p.biografia,
        p.foto_perfil_url,
        p.disponibilidad,
        p.ciudad,
        p.pais
        FROM usuario u
        INNER JOIN rol r ON r.id_rol = u.id_rol
        LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
        WHERE u.id_usuario = ?`,
        [id]
    );

    return rows[0] ?? null;
}

// Crea un nuevo usuario.
export async function create({
    idRol,
    nombres,
    apellidos,
    correoElectronico,
    contrasenaHash,
    alias
    }) {
    const [result] = await pool.execute(
        `INSERT INTO usuario
        (id_rol, nombres, apellidos, correo_electronico, contrasena_hash, alias)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
        idRol,
        nombres,
        apellidos,
        correoElectronico,
        contrasenaHash,
        alias
        ]
    );

    return findById(result.insertId);
}

// Actualiza los datos básicos del usuario autenticado.
export async function updatePerfil(idUsuario, datos) {
    await pool.execute(
        `UPDATE usuario
        SET nombres = ?, apellidos = ?, alias = ?
        WHERE id_usuario = ?`,
        [datos.nombres, datos.apellidos, datos.alias, idUsuario]
    );

    return findById(idUsuario);
}