// Repositorio del módulo de usuarios.
// Contiene las consultas SQL relacionadas con la tabla usuario.

import { pool } from '../../config/database.js';

// Busca un usuario por correo electrónico.
// Incluye el nombre del rol para que el token lleve el rol por nombre y no
// dependamos únicamente del identificador autoincremental.
export async function findByCorreo(correoElectronico) {
    const [rows] = await pool.execute(
        `SELECT
        u.id_usuario,
        u.id_rol,
        r.nombre AS rol,
        u.nombres,
        u.apellidos,
        u.correo_electronico,
        u.contrasena_hash,
        u.alias,
        u.estado_cuenta
        FROM usuario u
        INNER JOIN rol r ON r.id_rol = u.id_rol
        WHERE u.correo_electronico = ?`,
        [correoElectronico]
    );

    return rows[0] ?? null;
}

// Busca el identificador de un rol por su nombre.
// Así el registro de usuarios no depende del orden autoincremental de la tabla.
export async function findRolIdByNombre(nombre) {
    const [rows] = await pool.execute(
        `SELECT id_rol
        FROM rol
        WHERE nombre = ? AND estado = 'activo'`,
        [nombre]
    );

    return rows[0]?.id_rol ?? null;
}

// Actualiza la fecha del último acceso del usuario.
export async function registrarUltimoAcceso(idUsuario) {
    await pool.execute(
        `UPDATE usuario
        SET ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id_usuario = ?`,
        [idUsuario]
    );
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
        u.ultimo_acceso,
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

// Crea o actualiza la información ampliada del perfil (tabla perfil).
// Se usa ON DUPLICATE KEY UPDATE porque la relación es uno a uno.
export async function upsertPerfil(idUsuario, datos) {
    const valores = [
        datos.biografia ?? null,
        datos.fotoPerfilUrl ?? null,
        datos.disponibilidad ?? null,
        datos.ciudad ?? null,
        datos.pais ?? null
    ];

    await pool.execute(
        `INSERT INTO perfil
        (id_usuario, biografia, foto_perfil_url, disponibilidad, ciudad, pais)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        biografia = ?,
        foto_perfil_url = ?,
        disponibilidad = ?,
        ciudad = ?,
        pais = ?`,
        [idUsuario, ...valores, ...valores]
    );

    return findById(idUsuario);
}
