// Controlador del módulo de eventos.
// GET /api/eventos mantiene una conexión SSE abierta y GET /api/eventos/feed
// devuelve el mismo resumen en formato REST para el sondeo delta.

import * as eventosRegistro from './eventos.registro.js';
import * as eventosService from './eventos.service.js';

// Abre el flujo SSE. La conexión no consulta la base de datos: solo se envía
// el evento "conectado"; el cliente pide el estado con GET /api/eventos/feed.
export function abrirEventos(req, res) {
    const idUsuario = req.usuario.idUsuario;

    // El límite se comprueba antes de escribir encabezados para poder responder 429.
    if (!eventosRegistro.hayCupo(idUsuario)) {
        return res.status(429).json({
            success: false,
            message: `Ya tienes ${eventosRegistro.MAXIMO_CONEXIONES_POR_USUARIO} conexiones de eventos abiertas.`
        });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    // no-transform evita que un proxy comprima el flujo y lo retenga.
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // Nginx y algunos balanceadores almacenan la respuesta si no se les avisa.
    res.setHeader('X-Accel-Buffering', 'no');
    // Envía los encabezados sin esperar al primer evento.
    res.flushHeaders?.();

    // Espera de reconexión que usará EventSource si el flujo se corta.
    res.write('retry: 5000\n\n');

    if (!eventosRegistro.suscribir(idUsuario, res)) {
        return res.end();
    }

    // Evento inicial: confirma al cliente que la suscripción está activa.
    res.write(
        eventosRegistro.formatearEvento('conectado', {
            idUsuario,
            intervaloLatidoMs: eventosRegistro.INTERVALO_LATIDO_MS
        })
    );

    // Al cerrar (cierre del cliente, error de red o apagado) se libera el
    // registro y se detiene el latido; de lo contrario el Map crecería sin fin.
    req.on('close', () => {
        eventosRegistro.desuscribir(idUsuario, res);
    });
}

// Estado actual del feed de notificaciones (sondeo delta o carga inicial).
export async function obtenerFeed(req, res, next) {
    try {
        const feed = await eventosService.obtenerFeed(req.usuario.idUsuario);

        return res.status(200).json({
            success: true,
            message: 'Feed de notificaciones consultado correctamente.',
            data: feed
        });
    } catch (error) {
        next(error);
    }
}
