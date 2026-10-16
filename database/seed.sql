-- =========================================================
-- SkillMatch — Datos iniciales para desarrollo
-- =========================================================

USE skillmatch;

-- =========================================================
-- 1. ROLES
-- =========================================================

INSERT INTO rol (nombre, descripcion, estado)
SELECT
    'usuario',
    'Persona registrada que ofrece y solicita habilidades.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre = 'usuario'
);

INSERT INTO rol (nombre, descripcion, estado)
SELECT
    'administrador',
    'Persona encargada de gestionar y moderar la plataforma.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM rol WHERE nombre = 'administrador'
);

-- =========================================================
-- 2. CATEGORIAS
-- =========================================================

INSERT INTO categoria (nombre, descripcion, estado)
SELECT
    'Programación',
    'Desarrollo de software, lenguajes y bases de datos.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Programación'
);

INSERT INTO categoria (nombre, descripcion, estado)
SELECT
    'Idiomas',
    'Aprendizaje y práctica de lenguas.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Idiomas'
);

INSERT INTO categoria (nombre, descripcion, estado)
SELECT
    'Diseño',
    'Diseño visual y de experiencias digitales.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Diseño'
);

INSERT INTO categoria (nombre, descripcion, estado)
SELECT
    'Música',
    'Aprendizaje de instrumentos y conocimientos musicales.',
    'activo'
WHERE NOT EXISTS (
    SELECT 1 FROM categoria WHERE nombre = 'Música'
);

-- =========================================================
-- 3. HABILIDADES
--
-- Se busca la categoría por nombre.
-- No se presupone que tenga un identificador específico.
-- =========================================================

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'JavaScript',
    'Fundamentos de programación con JavaScript.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Programación'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'JavaScript'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Python',
    'Fundamentos de programación con Python.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Programación'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Python'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'SQL',
    'Consultas y manejo de bases de datos relacionales.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Programación'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'SQL'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Inglés',
    'Práctica de comunicación oral y escrita en inglés.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Idiomas'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Inglés'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Francés',
    'Fundamentos de comunicación en francés.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Idiomas'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Francés'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Diseño gráfico',
    'Composición visual y creación de piezas gráficas.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Diseño'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Diseño gráfico'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Diseño de interfaces',
    'Diseño de interfaces para aplicaciones web y móviles.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Diseño'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Diseño de interfaces'
    );

INSERT INTO habilidad (id_categoria, nombre, descripcion, estado)
SELECT
    c.id_categoria,
    'Guitarra',
    'Acordes, ritmo y acompañamiento con guitarra.',
    'activo'
FROM categoria AS c
WHERE c.nombre = 'Música'
    AND NOT EXISTS (
        SELECT 1
        FROM habilidad AS h
        WHERE h.id_categoria = c.id_categoria
            AND h.nombre = 'Guitarra'
    );