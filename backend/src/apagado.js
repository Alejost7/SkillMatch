// Apagado ordenado del servidor.
//
// Se aísla del punto de entrada porque en Windows no existen SIGTERM/SIGINT
// reales entre procesos: sin esta separación el apagado sólo podría probarse a
// mano en Linux.
//
// El orden es deliberado:
//   1. cerrarEventos(): las conexiones SSE no terminan solas y bloquearían
//      server.close() para siempre.
//   2. server.close(): deja de aceptar peticiones nuevas y resuelve cuando
//      terminan las que están en curso (las keep-alive inactivas se sueltan
//      con closeIdleConnections).
//   3. pool.end(): libera las conexiones a MySQL.
//
// El temporizador es la red de seguridad: si algo se cuelga, el proceso muere
// igualmente en lugar de quedar vivo consumiendo el crédito del trial.

export const TIEMPO_MAXIMO_APAGADO_MS = 10000;

/**
 * Crea la función de apagado.
 *
 * Los recursos se reciben como callbacks (`obtenerServidor`, `obtenerPool`)
 * porque todavía no existen cuando se registran las señales.
 */
export function crearApagado({
    obtenerServidor,
    obtenerPool,
    cerrarEventos,
    tiempoMaximoMs = TIEMPO_MAXIMO_APAGADO_MS,
    salir = (codigo) => process.exit(codigo),
    registrar = console
} = {}) {
    let apagando = false;

    return async function apagar(motivo, codigoSalida = 0) {
        // Una segunda señal (Railway puede repetirla) no debe reiniciar el
        // proceso de cierre ni duplicar los logs.
        if (apagando) {
            return;
        }

        apagando = true;

        registrar.log(`Apagando SkillMatch (${motivo})...`);

        const servidor = obtenerServidor?.() ?? null;
        const pool = obtenerPool?.() ?? null;

        const limite = setTimeout(() => {
            registrar.error(
                `El apagado superó ${tiempoMaximoMs} ms; se cierra el proceso por la fuerza.`
            );
            salir(codigoSalida === 0 ? 1 : codigoSalida);
        }, tiempoMaximoMs);

        limite.unref?.();

        try {
            cerrarEventos?.();

            if (servidor) {
                await new Promise((resolver) => {
                    servidor.close(() => resolver());
                    servidor.closeIdleConnections?.();
                });
            }

            if (pool) {
                await Promise.resolve(pool.end()).catch((error) =>
                    registrar.error(
                        'No fue posible cerrar el pool de MySQL:',
                        error.message
                    )
                );
            }
        } finally {
            clearTimeout(limite);
        }

        registrar.log('Apagado completado.');

        salir(codigoSalida);
    };
}
