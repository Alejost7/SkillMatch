// Pruebas del apagado ordenado del servidor.
//
// Se usan dobles de servidor y pool: lo que se verifica es el ORDEN del cierre
// y que el proceso siempre termine, no los sockets reales.

import assert from 'node:assert/strict';
import test from 'node:test';

import { crearApagado, TIEMPO_MAXIMO_APAGADO_MS } from '../src/apagado.js';

// Registro de consola en memoria para poder afirmar sobre los mensajes.
function crearRegistro() {
    const mensajes = [];

    return {
        mensajes,
        log: (...partes) => mensajes.push(partes.join(' ')),
        error: (...partes) => mensajes.push(partes.join(' '))
    };
}

// Servidor falso que anota cuándo se le llama.
function crearServidorFalso(orden) {
    return {
        close: (callback) => {
            orden.push('servidor');
            setImmediate(callback);
        },
        closeIdleConnections: () => orden.push('idle')
    };
}

function crearPoolFalso(orden) {
    return {
        end: async () => {
            orden.push('pool');
        }
    };
}

test('el tiempo máximo de apagado es una constante razonable', () => {
    assert.equal(TIEMPO_MAXIMO_APAGADO_MS, 10000);
});

test('cierra los SSE antes que el servidor y libera el pool al final', async () => {
    const orden = [];
    const registro = crearRegistro();
    const codigos = [];

    const apagar = crearApagado({
        obtenerServidor: () => crearServidorFalso(orden),
        obtenerPool: () => crearPoolFalso(orden),
        cerrarEventos: () => orden.push('eventos'),
        salir: (codigo) => codigos.push(codigo),
        registrar: registro
    });

    await apagar('SIGTERM');

    assert.deepEqual(orden, ['eventos', 'servidor', 'idle', 'pool']);
    assert.deepEqual(codigos, [0]);
    assert.match(registro.mensajes[0], /Apagando SkillMatch \(SIGTERM\)/);
    assert.match(registro.mensajes.at(-1), /Apagado completado/);
});

test('funciona cuando el arranque falló y no hay servidor ni pool', async () => {
    const codigos = [];
    const registro = crearRegistro();

    const apagar = crearApagado({
        obtenerServidor: () => null,
        obtenerPool: () => null,
        salir: (codigo) => codigos.push(codigo),
        registrar: registro
    });

    await apagar('SIGINT');

    assert.deepEqual(codigos, [0]);
});

test('una segunda señal no repite el cierre', async () => {
    const orden = [];
    const codigos = [];

    const apagar = crearApagado({
        obtenerServidor: () => crearServidorFalso(orden),
        obtenerPool: () => crearPoolFalso(orden),
        cerrarEventos: () => orden.push('eventos'),
        salir: (codigo) => codigos.push(codigo),
        registrar: crearRegistro()
    });

    await Promise.all([apagar('SIGTERM'), apagar('SIGTERM')]);

    assert.deepEqual(codigos, [0]);
    assert.equal(orden.filter((paso) => paso === 'eventos').length, 1);
});

test('termina igualmente si el pool no se puede cerrar', async () => {
    const codigos = [];
    const registro = crearRegistro();

    const apagar = crearApagado({
        obtenerServidor: () => null,
        obtenerPool: () => ({
            end: async () => {
                throw new Error('conexión perdida');
            }
        }),
        salir: (codigo) => codigos.push(codigo),
        registrar: registro
    });

    await apagar('SIGTERM');

    assert.deepEqual(codigos, [0]);
    assert.ok(registro.mensajes.some((mensaje) => /pool de MySQL/.test(mensaje)));
});

test('fuerza la salida cuando el servidor no termina de cerrarse', async () => {
    const codigos = [];
    const registro = crearRegistro();

    const apagar = crearApagado({
        // close() nunca llama al callback: simula una petición colgada.
        obtenerServidor: () => ({
            close: () => {},
            closeIdleConnections: () => {}
        }),
        obtenerPool: () => null,
        tiempoMaximoMs: 5,
        salir: (codigo) => codigos.push(codigo),
        registrar: registro
    });

    void apagar('SIGTERM');

    await new Promise((resolver) => setTimeout(resolver, 40));

    assert.deepEqual(codigos, [1]);
    assert.ok(registro.mensajes.some((mensaje) => /por la fuerza/.test(mensaje)));
});

test('conserva el código de salida distinto de cero', async () => {
    const codigos = [];

    const apagar = crearApagado({
        obtenerServidor: () => null,
        obtenerPool: () => null,
        salir: (codigo) => codigos.push(codigo),
        registrar: crearRegistro()
    });

    await apagar('error del servidor', 1);

    assert.deepEqual(codigos, [1]);
});
