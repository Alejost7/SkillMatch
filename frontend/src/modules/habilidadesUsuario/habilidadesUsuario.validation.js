// Validaciones de las habilidades del usuario.
// Los valores permitidos coinciden con las restricciones CHECK del backend.

export const NIVELES = ['basico', 'intermedio', 'avanzado'];
export const ESTADOS = ['activo', 'inactivo'];

export const ETIQUETAS_NIVEL = {
    basico: 'Básico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
};

export const OPCIONES_NIVEL = NIVELES.map((nivel) => ({
    valor: nivel,
    etiqueta: ETIQUETAS_NIVEL[nivel]
}));

export const OPCIONES_ESTADO = [
    { valor: 'activo', etiqueta: 'Activo' },
    { valor: 'inactivo', etiqueta: 'Inactivo' }
];

const MAX_DESCRIPCION_APOYO = 500;
const MAX_OBJETIVO_APRENDIZAJE = 500;

/**
 * Valida el formulario de una habilidad ofrecida.
 * nivel y estado son opcionales al crear (el backend usa valores por defecto).
 */
export function validarOfrecida(datos) {
    const errores = {};

    if (!datos.idHabilidad) {
        errores.idHabilidad = 'Selecciona la habilidad que ofreces.';
    }

    if (datos.nivel && !NIVELES.includes(datos.nivel)) {
        errores.nivel = 'Selecciona un nivel válido.';
    }

    if ([...datos.descripcionApoyo.trim()].length > MAX_DESCRIPCION_APOYO) {
        errores.descripcionApoyo = `La descripción no puede superar los ${MAX_DESCRIPCION_APOYO} caracteres.`;
    }

    if (datos.estado && !ESTADOS.includes(datos.estado)) {
        errores.estado = 'Selecciona un estado válido.';
    }

    return errores;
}

/**
 * Valida el formulario de una habilidad requerida.
 */
export function validarRequerida(datos) {
    const errores = {};

    if (!datos.idHabilidad) {
        errores.idHabilidad = 'Selecciona la habilidad que quieres aprender.';
    }

    if (datos.nivelDeseado && !NIVELES.includes(datos.nivelDeseado)) {
        errores.nivelDeseado = 'Selecciona un nivel válido.';
    }

    if (
        [...datos.objetivoAprendizaje.trim()].length >
        MAX_OBJETIVO_APRENDIZAJE
    ) {
        errores.objetivoAprendizaje = `El objetivo no puede superar los ${MAX_OBJETIVO_APRENDIZAJE} caracteres.`;
    }

    if (datos.estado && !ESTADOS.includes(datos.estado)) {
        errores.estado = 'Selecciona un estado válido.';
    }

    return errores;
}
