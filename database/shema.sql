-- =========================================================
-- SkillMatch
-- Esquema inicial
--
-- Este archivo crea la estructura de la base de datos.
-- Los datos iniciales se cargarán desde seed.sql.
-- =========================================================

CREATE DATABASE IF NOT EXISTS skillmatch
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE skillmatch;

-- =========================================================
-- 1. ROL
-- =========================================================

CREATE TABLE rol (
    id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT uq_rol_nombre
        UNIQUE (nombre),

    CONSTRAINT chk_rol_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 2. USUARIO
-- =========================================================

CREATE TABLE usuario (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_rol INT UNSIGNED NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(120) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    alias VARCHAR(50),
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_cuenta VARCHAR(20) NOT NULL DEFAULT 'activo',
    ultimo_acceso DATETIME,

    CONSTRAINT uq_usuario_correo
        UNIQUE (correo_electronico),

    CONSTRAINT uq_usuario_alias
        UNIQUE (alias),

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol (id_rol)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_usuario_estado
        CHECK (
            estado_cuenta IN (
                'activo',
                'inactivo',
                'suspendido',
                'eliminado'
            )
        )
) ENGINE=InnoDB;

-- =========================================================
-- 3. PERFIL
-- =========================================================

CREATE TABLE perfil (
    id_perfil INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    biografia TEXT,
    foto_perfil_url VARCHAR(255),
    disponibilidad VARCHAR(100),
    ciudad VARCHAR(80),
    pais VARCHAR(80),
    fecha_actualizacion DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_perfil_usuario
        UNIQUE (id_usuario),

    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- 4. CATEGORIA
-- =========================================================

CREATE TABLE categoria (
    id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_categoria_nombre
        UNIQUE (nombre),

    CONSTRAINT chk_categoria_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 5. HABILIDAD
-- =========================================================

CREATE TABLE habilidad (
    id_habilidad INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_habilidad_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_habilidad_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 6. USUARIO_HABILIDAD_OFRECIDA
-- =========================================================

CREATE TABLE usuario_habilidad_ofrecida (
    id_habilidad_ofrecida INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_habilidad INT UNSIGNED NOT NULL,
    nivel VARCHAR(30) NOT NULL,
    descripcion_apoyo TEXT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT uq_ofrecida_usuario_habilidad
        UNIQUE (id_usuario, id_habilidad),

    CONSTRAINT fk_ofrecida_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_ofrecida_habilidad
        FOREIGN KEY (id_habilidad)
        REFERENCES habilidad (id_habilidad)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_ofrecida_nivel
        CHECK (nivel IN ('basico', 'intermedio', 'avanzado')),

    CONSTRAINT chk_ofrecida_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 7. USUARIO_HABILIDAD_REQUERIDA
-- =========================================================

CREATE TABLE usuario_habilidad_requerida (
    id_habilidad_requerida INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_habilidad INT UNSIGNED NOT NULL,
    nivel_deseado VARCHAR(30),
    objetivo_aprendizaje TEXT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT uq_requerida_usuario_habilidad
        UNIQUE (id_usuario, id_habilidad),

    CONSTRAINT fk_requerida_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_requerida_habilidad
        FOREIGN KEY (id_habilidad)
        REFERENCES habilidad (id_habilidad)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_requerida_nivel
        CHECK (
            nivel_deseado IS NULL
            OR nivel_deseado IN ('basico', 'intermedio', 'avanzado')
        ),

    CONSTRAINT chk_requerida_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 8. SOLICITUD_CONEXION
-- =========================================================

CREATE TABLE solicitud_conexion (
    id_solicitud INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario_emisor INT UNSIGNED NOT NULL,
    id_usuario_receptor INT UNSIGNED NOT NULL,
    mensaje_inicial TEXT,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_solicitud VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_respuesta DATETIME,

    CONSTRAINT fk_solicitud_emisor
        FOREIGN KEY (id_usuario_emisor)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_solicitud_receptor
        FOREIGN KEY (id_usuario_receptor)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_solicitud_usuarios_distintos
        CHECK (id_usuario_emisor <> id_usuario_receptor),

    CONSTRAINT chk_solicitud_estado
        CHECK (
            estado_solicitud IN (
                'pendiente',
                'aceptada',
                'rechazada',
                'cancelada'
            )
        ),

    CONSTRAINT chk_solicitud_fechas
        CHECK (
            fecha_respuesta IS NULL
            OR fecha_respuesta >= fecha_envio
        )
) ENGINE=InnoDB;

-- =========================================================
-- 9. CONEXION
-- =========================================================

CREATE TABLE conexion (
    id_conexion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT UNSIGNED NOT NULL,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_conexion VARCHAR(20) NOT NULL DEFAULT 'activa',

    CONSTRAINT uq_conexion_solicitud
        UNIQUE (id_solicitud),

    CONSTRAINT fk_conexion_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitud_conexion (id_solicitud)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_conexion_estado
        CHECK (
            estado_conexion IN (
                'activa',
                'finalizada',
                'bloqueada'
            )
        )
) ENGINE=InnoDB;

-- =========================================================
-- 10. MENSAJE
-- =========================================================

CREATE TABLE mensaje (
    id_mensaje INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_conexion INT UNSIGNED NOT NULL,
    id_remitente INT UNSIGNED NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_mensaje_conexion
        FOREIGN KEY (id_conexion)
        REFERENCES conexion (id_conexion)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_mensaje_remitente
        FOREIGN KEY (id_remitente)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_mensaje_leido
        CHECK (leido IN (0, 1)),

    INDEX idx_mensaje_conexion_fecha (id_conexion, fecha_envio)
) ENGINE=InnoDB;

-- =========================================================
-- 11. CALIFICACION
-- =========================================================

CREATE TABLE calificacion (
    id_calificacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_conexion INT UNSIGNED NOT NULL,
    id_calificador INT UNSIGNED NOT NULL,
    id_calificado INT UNSIGNED NOT NULL,
    puntuacion TINYINT UNSIGNED NOT NULL,
    comentario TEXT,
    fecha_calificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_calificacion_intercambio
        UNIQUE (id_conexion, id_calificador, id_calificado),

    CONSTRAINT fk_calificacion_conexion
        FOREIGN KEY (id_conexion)
        REFERENCES conexion (id_conexion)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_calificacion_calificador
        FOREIGN KEY (id_calificador)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_calificacion_calificado
        FOREIGN KEY (id_calificado)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_calificacion_puntuacion
        CHECK (puntuacion BETWEEN 1 AND 5),

    CONSTRAINT chk_calificacion_usuarios_distintos
        CHECK (id_calificador <> id_calificado)
) ENGINE=InnoDB;

-- =========================================================
-- 12. MODERACION_USUARIO
-- =========================================================

CREATE TABLE moderacion_usuario (
    id_moderacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_admin INT UNSIGNED NOT NULL,
    id_usuario_objetivo INT UNSIGNED NOT NULL,
    tipo_accion VARCHAR(30) NOT NULL,
    motivo TEXT NOT NULL,
    fecha_accion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_accion VARCHAR(20) NOT NULL DEFAULT 'vigente',

    CONSTRAINT fk_moderacion_admin
        FOREIGN KEY (id_admin)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_moderacion_objetivo
        FOREIGN KEY (id_usuario_objetivo)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_moderacion_tipo
        CHECK (
            tipo_accion IN (
                'advertencia',
                'suspension',
                'reactivacion',
                'eliminacion'
            )
        ),

    CONSTRAINT chk_moderacion_estado
        CHECK (estado_accion IN ('vigente', 'revocada'))
) ENGINE=InnoDB;

-- =========================================================
-- 13. POLITICA_DATOS
-- =========================================================

CREATE TABLE politica_datos (
    id_politica INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version_politica VARCHAR(20) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT uq_politica_version
        UNIQUE (version_politica),

    CONSTRAINT chk_politica_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =========================================================
-- 14. ACEPTACION_POLITICA
-- =========================================================

CREATE TABLE aceptacion_politica (
    id_aceptacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_politica INT UNSIGNED NOT NULL,
    fecha_aceptacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(45) NOT NULL,

    CONSTRAINT uq_aceptacion_usuario_politica
        UNIQUE (id_usuario, id_politica),

    CONSTRAINT fk_aceptacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_aceptacion_politica
        FOREIGN KEY (id_politica)
        REFERENCES politica_datos (id_politica)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
) ENGINE=InnoDB;