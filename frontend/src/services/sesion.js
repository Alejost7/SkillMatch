// Persistencia de la sesión del usuario autenticado.
// El token y los datos básicos del usuario se guardan en localStorage para que
// la sesión sobreviva a una recarga. La sesión es la única fuente del token:
// apiClient y el cliente SSE la consultan, nunca la reciben por parámetro.

const CLAVE_SESION = 'skillmatch.sesion';

// Evento que la aplicación escucha para reaccionar a un cierre de sesión.
// Se emite cuando el backend responde 401 con un token vencido.
export const EVENTO_SESION_EXPIRADA = 'skillmatch:sesion-expirada';

// Lee el texto guardado sin romper la aplicación cuando el navegador bloquea
// el almacenamiento (modo privado o políticas de privacidad).
function leerCrudo() {
    try {
        return window.localStorage.getItem(CLAVE_SESION);
    } catch {
        return null;
    }
}

/**
 * Devuelve la sesión guardada o null cuando no existe o está corrupta.
 * La forma de la sesión es { token, usuario }.
 */
export function obtenerSesion() {
    const crudo = leerCrudo();

    if (!crudo) {
        return null;
    }

    try {
        const sesion = JSON.parse(crudo);

        if (!sesion?.token || !sesion?.usuario?.idUsuario) {
            return null;
        }

        return sesion;
    } catch {
        return null;
    }
}

/**
 * Guarda la sesión y devuelve la copia almacenada.
 */
export function guardarSesion({ token, usuario }) {
    const sesion = { token, usuario };

    try {
        window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
        // Sin almacenamiento la sesión solo dura lo que viva la pestaña.
    }

    return sesion;
}

/**
 * Actualiza los datos del usuario conservando el token.
 * Se usa después de editar el perfil para refrescar el saludo y el rol.
 */
export function actualizarUsuarioSesion(usuario) {
    const actual = obtenerSesion();

    if (!actual) {
        return null;
    }

    return guardarSesion({ token: actual.token, usuario });
}

/**
 * Devuelve el token vigente o null.
 */
export function obtenerToken() {
    return obtenerSesion()?.token ?? null;
}

/**
 * Elimina la sesión sin emitir avisos.
 */
export function borrarSesion() {
    try {
        window.localStorage.removeItem(CLAVE_SESION);
    } catch {
        // Nada que limpiar si el almacenamiento no está disponible.
    }
}

/**
 * Cierra la sesión por vencimiento y avisa a la aplicación.
 * apiClient la llama cuando el backend responde 401 con un token enviado.
 */
export function cerrarSesionExpirada(motivo = 'expirada') {
    const habiaSesion = Boolean(obtenerSesion());

    borrarSesion();

    if (habiaSesion) {
        window.dispatchEvent(
            new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: { motivo } })
        );
    }
}

export { CLAVE_SESION };
