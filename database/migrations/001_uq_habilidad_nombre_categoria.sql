-- =========================================================
-- SkillMatch — Migración 001
-- Restricción única: una habilidad no puede repetirse dentro
-- de la misma categoría.
--
-- Es idempotente: si la restricción ya existe (o ya hay un
-- índice único equivalente), no hace nada.
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
--      mysql -u <usuario> -p <base> < 001_uq_habilidad_nombre_categoria.sql
-- =========================================================

-- 1. Revisión previa: duplicados que impedirían crear la restricción.
--    Si esta consulta devuelve filas, hay que resolverlas antes de aplicar
--    la restricción única.
SELECT
    id_categoria,
    nombre,
    COUNT(*) AS total
FROM habilidad
GROUP BY id_categoria, nombre
HAVING COUNT(*) > 1;

-- 2. ¿Ya existe una restricción con este nombre?
SET @restriccion_existente = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'habilidad'
      AND CONSTRAINT_NAME = 'uq_habilidad_nombre_categoria'
);

-- 3. ¿Ya existe un índice único equivalente con otro nombre?
SET @indice_equivalente = (
    SELECT COUNT(*)
    FROM (
        SELECT INDEX_NAME
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'habilidad'
          AND NON_UNIQUE = 0
        GROUP BY INDEX_NAME
        HAVING GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX)
            = 'id_categoria,nombre'
    ) AS indices_unicos
);

-- 4. Aplicar el cambio solo si hace falta.
SET @sentencia = IF(
    @restriccion_existente = 0 AND @indice_equivalente = 0,
    'ALTER TABLE habilidad ADD CONSTRAINT uq_habilidad_nombre_categoria UNIQUE (id_categoria, nombre)',
    'SELECT ''La restricción uq_habilidad_nombre_categoria ya está aplicada.'' AS resultado'
);

PREPARE sentencia FROM @sentencia;
EXECUTE sentencia;
DEALLOCATE PREPARE sentencia;

-- 5. Verificación final: debe devolver una fila con tipo UNIQUE.
SELECT
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'habilidad'
  AND CONSTRAINT_NAME = 'uq_habilidad_nombre_categoria';
