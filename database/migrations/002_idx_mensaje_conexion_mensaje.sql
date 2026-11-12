-- =========================================================
-- SkillMatch — Migración 002
-- Índice de apoyo para el sondeo delta de la mensajería:
-- (id_conexion, id_mensaje) permite resolver
-- "mensajes de esta conversación con id mayor que N"
-- con un recorrido de índice, sin ordenar la tabla.
--
-- Es idempotente: si el índice ya existe (con este nombre o
-- con las mismas columnas en el mismo orden), no hace nada.
--
-- Se ejecuta sobre la base de datos de SkillMatch, así que la
-- conexión ya debe estar situada en ella (el script del
-- backend lo hace automáticamente).
--
--   1) Con el script del backend:
--      cd backend
--      npm run db:migrate             (solo informa)
--      npm run db:migrate -- --aplicar (aplica)
--
--   2) Manualmente:
--      mysql -u <usuario> -p <base> < 002_idx_mensaje_conexion_mensaje.sql
--
-- Es opcional para el funcionamiento: sin el índice las
-- consultas siguen siendo correctas, solo más lentas cuando
-- la tabla mensaje crezca.
-- =========================================================

-- 1. ¿Ya existe un índice con este nombre?
SET @indice_existente = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'mensaje'
      AND INDEX_NAME = 'idx_mensaje_conexion_mensaje'
);

-- 2. ¿Ya existe un índice equivalente con otro nombre?
SET @indice_equivalente = (
    SELECT COUNT(*)
    FROM (
        SELECT INDEX_NAME
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'mensaje'
        GROUP BY INDEX_NAME
        HAVING GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX)
            = 'id_conexion,id_mensaje'
    ) AS indices_equivalentes
);

-- 3. Aplicar el cambio solo si hace falta.
SET @sentencia = IF(
    @indice_existente = 0 AND @indice_equivalente = 0,
    'ALTER TABLE mensaje ADD INDEX idx_mensaje_conexion_mensaje (id_conexion, id_mensaje)',
    'SELECT ''El índice idx_mensaje_conexion_mensaje ya está aplicado.'' AS resultado'
);

PREPARE sentencia FROM @sentencia;
EXECUTE sentencia;
DEALLOCATE PREPARE sentencia;

-- 4. Verificación final: debe devolver el índice con sus columnas en orden.
SELECT
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'mensaje'
  AND INDEX_NAME = 'idx_mensaje_conexion_mensaje'
ORDER BY SEQ_IN_INDEX;
