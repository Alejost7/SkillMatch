// Registro en memoria de las conexiones SSE (Server-Sent Events).
//
// Cada usuario puede tener varias pestañas abiertas, así que se guarda un Map
// por usuario: Map<idUsuario, Map<res, intervaloLatido>>. El Map interno es la
// clave para que la limpieza sea completa: al cerrar una conexión se borra su
// latido y, si el Map queda vacío, se borra también la entrada del usuario.
//
// Limitaciones asumidas y documentadas:
// - El registro vive en el proceso: no escala a varias instancias sin un bus
//   externo (Redis pub/sub). Con una sola instancia es suficiente.
// - La emisión es "best effort": la base de datos es la fuente de verdad y un
//   fallo al escribir en un socket nunca debe afectar a la respuesta REST.

// Cada cuánto se envía un comentario de latido por conexión.
// Sin latido, los proxies y balanceadores cortan la conexión inactiva a los
// 30-60 segundos y el cliente entra en un bucle de reconexión.
export const INTERVALO_LATIDO_MS = 30000;

// Máximo de conexiones SSE simultáneas por usuario.
// Con HTTP/1.1 el navegador limita a unas 6 conexiones por dominio, así que el
// cliente debe compartir una sola conexión entre pestañas.
export const MAXIMO_CONEXIONES_POR_USUARIO = 3;

// Comentario SSE: no genera evento en el cliente, solo mantiene viva la conexión.
const LATIDO = ': ping\n\n';

// Map<idUsuario, Map<res, intervaloLatido>>
const suscripciones = new Map();

// Indica si el flujo de respuesta todavía admite escrituras.
function estaAbierto(res) {
    return !res.writableEnded && !res.destroyed;
}

// Escribe en una conexión sin propagar errores al emisor.
// Devuelve false cuando la conexión ya no sirve y debe descartarse.
function escribir(res, texto) {
    if (!estaAbierto(res)) {
        return false;
    }

    try {
        res.write(texto);
        return true;
    } catch {
        return false;
    }
}

// Comprueba si el usuario puede abrir otra conexión SSE.
export function hayCupo(idUsuario) {
    const delUsuario = suscripciones.get(idUsuario);

    return !delUsuario || delUsuario.size < MAXIMO_CONEXIONES_POR_USUARIO;
}

// Registra una conexión SSE y arranca su latido.
// Devuelve false cuando el usuario ya alcanzó el máximo de conexiones.
export function suscribir(idUsuario, res) {
    if (!hayCupo(idUsuario)) {
        return false;
    }

    const delUsuario = suscripciones.get(idUsuario) ?? new Map();

    suscripciones.set(idUsuario, delUsuario);

    // Latido propio de esta conexión: se limpia en desuscribir().
    const latido = setInterval(() => {
        escribir(res, LATIDO);
    }, INTERVALO_LATIDO_MS);

    // El latido no debe mantener el proceso vivo por sí solo.
    if (typeof latido.unref === 'function') {
        latido.unref();
    }

    delUsuario.set(res, latido);

    return true;
}

// Elimina una conexión y limpia su latido.
// Si el usuario se queda sin conexiones, se borra su entrada del Map.
export function desuscribir(idUsuario, res) {
    const delUsuario = suscripciones.get(idUsuario);

    if (!delUsuario || !delUsuario.has(res)) {
        return false;
    }

    clearInterval(delUsuario.get(res));

    delUsuario.delete(res);

    if (delUsuario.size === 0) {
        suscripciones.delete(idUsuario);
    }

    return true;
}

// Número de conexiones SSE abiertas de un usuario.
// Se usa en el controlador (límite) y en las pruebas (verificar la limpieza).
export function contarSuscriptores(idUsuario) {
    return suscripciones.get(idUsuario)?.size ?? 0;
}

// Número de usuarios con al menos una conexión abierta.
export function contarUsuariosConectados() {
    return suscripciones.size;
}

// Construye la trama SSE de un evento con datos JSON.
export function formatearEvento(evento, datos) {
    return `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
}

// Envía un evento a todas las conexiones de un usuario.
// Las conexiones muertas se descartan en el acto para no acumular memoria.
function enviar(idUsuario, evento, datos) {
    const delUsuario = suscripciones.get(idUsuario);

    if (!delUsuario) {
        return 0;
    }

    const trama = formatearEvento(evento, datos);

    let enviados = 0;

    // Copiamos las claves porque desuscribir() modifica el Map.
    for (const res of [...delUsuario.keys()]) {
        if (escribir(res, trama)) {
            enviados += 1;
        } else {
            desuscribir(idUsuario, res);
        }
    }

    return enviados;
}

// Emite un evento a un usuario concreto. Nunca lanza: la persistencia ya
// ocurrió y una conexión caída no debe romper la respuesta REST.
export function emitirA(idUsuario, evento, datos) {
    try {
        return enviar(idUsuario, evento, datos);
    } catch {
        return 0;
    }
}

// Emite el mismo evento a varios usuarios, ignorando identificadores repetidos.
export function emitirAVarios(idsUsuarios, evento, datos) {
    let enviados = 0;

    for (const idUsuario of new Set(idsUsuarios)) {
        enviados += emitirA(idUsuario, evento, datos);
    }

    return enviados;
}

// Cierra todas las conexiones (apagado del servidor y pruebas).
export function cerrarTodos() {
    for (const delUsuario of suscripciones.values()) {
        for (const [res, latido] of delUsuario) {
            clearInterval(latido);

            try {
                res.end();
            } catch {
                // Una conexión ya cerrada no requiere acción.
            }
        }
    }

    suscripciones.clear();
}
