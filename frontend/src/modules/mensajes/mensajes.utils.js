// Utilidades de la conversación.
// El chat mezcla mensajes cargados, mensajes nuevos de SSE y deltas del sondeo,
// así que necesita fusionar sin duplicar y mantener el orden cronológico.

/**
 * Une dos listas de mensajes evitando duplicados por idMensaje.
 * El resultado queda en orden ascendente (del más antiguo al más reciente).
 */
export function fusionarMensajes(actuales = [], nuevos = []) {
    const porId = new Map();

    for (const mensaje of [...actuales, ...nuevos]) {
        porId.set(mensaje.idMensaje, mensaje);
    }

    return [...porId.values()].sort(
        (primero, segundo) => primero.idMensaje - segundo.idMensaje
    );
}

/**
 * Identificador del último mensaje recibido. Es el punto de partida del sondeo
 * delta (?desde=<idMensaje>).
 */
export function ultimoIdMensaje(mensajes = []) {
    if (mensajes.length === 0) {
        return 0;
    }

    return mensajes[mensajes.length - 1].idMensaje;
}
