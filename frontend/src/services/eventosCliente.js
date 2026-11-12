// Cliente SSE (Server-Sent Events) de SkillMatch.
//
// Es un módulo singleton con contador de suscriptores: aunque varios
// componentes escuchen los eventos, solo existe una conexión EventSource por
// pestaña. Esto también hace segura la doble ejecución de efectos en StrictMode.
//
// El EventSource no permite encabezados, así que el token viaja en la query
// (?token=<jwt>), tal como documenta la sección 10 de ENDPOINTS.TXT.

import { obtenerToken } from './sesion.js';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');

// Eventos con nombre que emite el backend.
const TIPOS_EVENTO = [
    'conectado',
    'mensaje',
    'solicitud',
    'conexion',
    'calificacion',
    'feed'
];

// Espera antes de reintentar cuando se cierra la conexión.
const REINTENTO_MS = 5000;

// Cada cuánto se pide el feed aunque el flujo SSE parezca vivo. El latido del
// backend es un comentario que EventSource no expone, así que esta consulta
// periódica es la red de seguridad: refresca las notificaciones y, si el token
// venció, apiClient cierra la sesión.
const VIGILANCIA_MS = 45000;

let fuente = null;
let modo = 'desconectado';
let suscriptores = new Set();
let temporizadorReintento = null;
let vigilante = null;

function notificarEstado(nuevoModo) {
    if (modo === nuevoModo) {
        return;
    }

    modo = nuevoModo;

    for (const suscriptor of suscriptores) {
        suscriptor.alEstado?.(modo);
    }
}

function emitir(tipo, datos = {}) {
    for (const suscriptor of suscriptores) {
        suscriptor.alEvento?.({ tipo, datos });
    }
}

function cerrarFuente() {
    if (!fuente) {
        return;
    }

    // Se anula onerror antes de cerrar para no disparar un reintento artificial.
    fuente.onerror = null;
    fuente.onopen = null;
    fuente.close();
    fuente = null;
}

function detenerVigilancia() {
    if (vigilante !== null) {
        clearInterval(vigilante);
        vigilante = null;
    }
}

function iniciarVigilancia() {
    detenerVigilancia();

    vigilante = setInterval(() => {
        emitir('vigilancia', {});
    }, VIGILANCIA_MS);
}

function programarReintento(retraso = REINTENTO_MS) {
    if (temporizadorReintento !== null) {
        return;
    }

    temporizadorReintento = setTimeout(() => {
        temporizadorReintento = null;
        abrir();
    }, retraso);
}

function manejarError() {
    // EventSource reintenta solo, pero se cierra para controlar el intervalo y
    // evitar varios flujos superpuestos.
    cerrarFuente();
    detenerVigilancia();
    notificarEstado('reconectando');

    // La aplicación revalida la sesión consultando el feed.
    emitir('error', { motivo: 'conexion' });

    programarReintento();
}

function abrir() {
    const token = obtenerToken();

    if (!token) {
        detener(false);
        notificarEstado('sin-sesion');
        return;
    }

    cerrarFuente();
    notificarEstado('conectando');

    const evento = new EventSource(
        `${BASE_URL}/eventos?token=${encodeURIComponent(token)}`
    );

    fuente = evento;

    evento.onopen = () => {
        notificarEstado('conectado');
        iniciarVigilancia();
    };

    evento.onerror = () => {
        manejarError();
    };

    for (const tipo of TIPOS_EVENTO) {
        evento.addEventListener(tipo, (mensaje) => {
            let datos;

            try {
                datos = mensaje.data ? JSON.parse(mensaje.data) : {};
            } catch {
                datos = { crudo: mensaje.data };
            }

            emitir(tipo, datos);
        });
    }
}

function detener(notificar = true) {
    cerrarFuente();
    detenerVigilancia();

    if (temporizadorReintento !== null) {
        clearTimeout(temporizadorReintento);
        temporizadorReintento = null;
    }

    if (notificar) {
        notificarEstado('desconectado');
    }
}

/**
 * Escucha los eventos del usuario autenticado.
 *
 * alEvento recibe { tipo, datos } con los tipos documentados por el backend más
 * dos locales: "vigilancia" (revalidación periódica) y "error" (fallo de
 * conexión). alEstado recibe el modo actual: sin-sesion, conectando, conectado,
 * reconectando o desconectado.
 *
 * Devuelve la función para dejar de escuchar. La conexión SSE se cierra cuando
 * se va el último suscriptor.
 */
export function suscribirEventos({ alEvento, alEstado } = {}) {
    const suscriptor = { alEvento, alEstado };

    suscriptores.add(suscriptor);

    if (suscriptores.size === 1) {
        abrir();
    }

    return () => {
        suscriptores.delete(suscriptor);

        if (suscriptores.size === 0) {
            detener();
        }
    };
}

/**
 * Fuerza la reapertura del flujo. Se usa cuando el token cambia.
 */
export function reconectarEventos() {
    if (suscriptores.size === 0) {
        return;
    }

    cerrarFuente();

    if (temporizadorReintento !== null) {
        clearTimeout(temporizadorReintento);
        temporizadorReintento = null;
    }

    abrir();
}

/**
 * Modo actual de la conexión. Útil para mostrar el indicador de estado.
 */
export function estadoEventos() {
    return modo;
}
