// Mapeos de las habilidades del usuario.
// Se usan tanto en los endpoints del usuario autenticado como en el perfil
// público, para que las respuestas tengan siempre la misma forma.

// Convierte una fila de usuario_habilidad_ofrecida a camelCase.
export function mapearOfrecida(fila) {
    return {
        idHabilidadOfrecida: fila.id_habilidad_ofrecida,
        idHabilidad: fila.id_habilidad,
        habilidad: fila.habilidad,
        idCategoria: fila.id_categoria,
        categoria: fila.categoria,
        nivel: fila.nivel,
        descripcionApoyo: fila.descripcion_apoyo,
        estado: fila.estado,
        fechaRegistro: fila.fecha_registro
    };
}

// Convierte una fila de usuario_habilidad_requerida a camelCase.
export function mapearRequerida(fila) {
    return {
        idHabilidadRequerida: fila.id_habilidad_requerida,
        idHabilidad: fila.id_habilidad,
        habilidad: fila.habilidad,
        idCategoria: fila.id_categoria,
        categoria: fila.categoria,
        nivelDeseado: fila.nivel_deseado,
        objetivoAprendizaje: fila.objetivo_aprendizaje,
        estado: fila.estado,
        fechaRegistro: fila.fecha_registro
    };
}

// Agrupa las habilidades de varios usuarios por id_usuario.
// Se usa en los listados para resolver todas las habilidades de la página con
// dos consultas en lugar de una por usuario.
export function agruparPorUsuario(ofrecidas = [], requeridas = []) {
    const habilidades = new Map();

    for (const fila of ofrecidas) {
        const grupo = obtenerGrupo(habilidades, fila.id_usuario);

        grupo.ofrecidas.push(mapearOfrecida(fila));
    }

    for (const fila of requeridas) {
        const grupo = obtenerGrupo(habilidades, fila.id_usuario);

        grupo.requeridas.push(mapearRequerida(fila));
    }

    return habilidades;
}

// Estructura vacía usada cuando un usuario no tiene habilidades registradas.
export function habilidadesVacias() {
    return { ofrecidas: [], requeridas: [] };
}

// Devuelve el grupo de un usuario, creándolo si es la primera habilidad.
function obtenerGrupo(habilidades, idUsuario) {
    if (!habilidades.has(idUsuario)) {
        habilidades.set(idUsuario, habilidadesVacias());
    }

    return habilidades.get(idUsuario);
}