// Formato compartido de fechas, nombres y nivel.
// Se define una sola vez para que todas las pantallas muestren la información
// con el mismo criterio (español de Colombia).

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
});

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

const FORMATO_HORA = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
});

const ETIQUETAS_NIVEL = {
    basico: 'Básico',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado'
};

const ETIQUETAS_ESTADO = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
    activa: 'Activa',
    finalizada: 'Finalizada',
    bloqueada: 'Bloqueada'
};

// Convierte un valor ISO en una fecha legible. Sin dato devuelve una raya.
function convertirFecha(valor) {
    if (!valor) {
        return null;
    }

    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearFecha(valor) {
    const fecha = convertirFecha(valor);

    return fecha ? FORMATO_FECHA.format(fecha) : '—';
}

export function formatearFechaHora(valor) {
    const fecha = convertirFecha(valor);

    return fecha ? FORMATO_FECHA_HORA.format(fecha) : '—';
}

export function formatearHora(valor) {
    const fecha = convertirFecha(valor);

    return fecha ? FORMATO_HORA.format(fecha) : '';
}

/**
 * Nombre visible de una persona: nombres y apellidos, con el alias como
 * respaldo cuando la cuenta no los tiene.
 */
export function nombreCompleto(usuario) {
    if (!usuario) {
        return 'Usuario';
    }

    const nombre = [usuario.nombres, usuario.apellidos]
        .filter(Boolean)
        .join(' ')
        .trim();

    return nombre || usuario.alias || 'Usuario';
}

/**
 * Iniciales para el avatar circular.
 */
export function iniciales(usuario) {
    const partes = nombreCompleto(usuario).split(/\s+/).filter(Boolean);

    const letras = partes
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('');

    return letras || '?';
}

export function etiquetaNivel(nivel) {
    return ETIQUETAS_NIVEL[nivel] ?? 'Sin definir';
}

export function etiquetaEstado(estado) {
    return ETIQUETAS_ESTADO[estado] ?? estado ?? '—';
}

/**
 * Promedio legible: dos decimales como máximo y "Sin datos" si no hay
 * calificaciones registradas.
 */
export function formatearPromedio(promedio, total = 0) {
    if (!total) {
        return 'Sin calificaciones';
    }

    const numero = Number(promedio);

    if (!Number.isFinite(numero)) {
        return 'Sin calificaciones';
    }

    return numero.toFixed(2);
}
