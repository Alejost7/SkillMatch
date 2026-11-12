// Pruebas del registro de conexiones SSE.
// No tocan la base de datos: el registro es un Map en memoria, así que aquí se
// verifica la entrega, el latido y, sobre todo, la limpieza al cerrar.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    INTERVALO_LATIDO_MS,
    MAXIMO_CONEXIONES_POR_USUARIO,
    cerrarTodos,
    contarSuscriptores,
    contarUsuariosConectados,
    desuscribir,
    emitirA,
    emitirAVarios,
    formatearEvento,
    hayCupo,
    suscribir
} from '../../src/modules/eventos/eventos.registro.js';

// Respuesta falsa que se comporta como un stream SSE: registra lo escrito.
function crearRes() {
    const res = {
        escrituras: [],
        cerrada: false,
        writableEnded: false,
        destroyed: false,
        write(texto) {
            res.escrituras.push(texto);
            return true;
        },
        end() {
            res.cerrada = true;
            res.writableEnded = true;
        }
    };

    return res;
}

// Trama esperada de un evento con datos simples.
function trama(evento, datos) {
    return `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
}

test('formatearEvento construye la trama SSE con datos JSON', () => {
    assert.equal(
        formatearEvento('mensaje', { idMensaje: 3 }),
        'event: mensaje\ndata: {"idMensaje":3}\n\n'
    );
});

test('cerrar una conexión la elimina del registro', (t) => {
    t.after(cerrarTodos);

    const primera = crearRes();
    const segunda = crearRes();

    assert.equal(suscribir(8, primera), true);
    assert.equal(suscribir(8, segunda), true);
    assert.equal(contarSuscriptores(8), 2);
    assert.equal(contarUsuariosConectados(), 1);

    // El cierre normal (evento "close" del cliente) llama a desuscribir().
    assert.equal(desuscribir(8, primera), true);
    assert.equal(contarSuscriptores(8), 1);

    assert.equal(desuscribir(8, segunda), true);
    assert.equal(contarSuscriptores(8), 0);
    // Sin conexiones, la entrada del usuario desaparece del Map.
    assert.equal(contarUsuariosConectados(), 0);

    // Un cierre repetido no altera el estado.
    assert.equal(desuscribir(8, segunda), false);
});

test('el latido se envía cada 30 segundos y se detiene al cerrar', (t) => {
    t.after(cerrarTodos);
    t.mock.timers.enable({ apis: ['setInterval'] });

    const res = crearRes();

    suscribir(7, res);

    // Nada se escribe antes del primer latido: la conexión nace limpia.
    assert.deepEqual(res.escrituras, []);

    t.mock.timers.tick(INTERVALO_LATIDO_MS - 1);
    assert.equal(res.escrituras.length, 0);

    t.mock.timers.tick(1);
    assert.deepEqual(res.escrituras, [': ping\n\n']);

    // Tras cerrar, el intervalo se limpia: no deben quedar escrituras.
    desuscribir(7, res);

    t.mock.timers.tick(INTERVALO_LATIDO_MS * 5);

    assert.equal(res.escrituras.length, 1);
    assert.equal(contarSuscriptores(7), 0);
});

test('emitirA entrega solo al destinatario, con formato SSE', (t) => {
    t.after(cerrarTodos);

    const res = crearRes();

    suscribir(10, res);

    // Un usuario sin conexiones abiertas no recibe nada y no provoca errores.
    assert.equal(emitirA(11, 'mensaje', { idMensaje: 1 }), 0);
    assert.equal(res.escrituras.length, 0);

    assert.equal(emitirA(10, 'mensaje', { idMensaje: 1 }), 1);
    assert.deepEqual(res.escrituras, [trama('mensaje', { idMensaje: 1 })]);

    // Todas las pestañas del usuario reciben el mismo evento.
    const otraPestana = crearRes();

    suscribir(10, otraPestana);

    assert.equal(emitirA(10, 'feed', { motivo: 'mensaje' }), 2);
    assert.equal(otraPestana.escrituras.length, 1);
});

test('emitirAVarios ignora identificadores repetidos', (t) => {
    t.after(cerrarTodos);

    const primera = crearRes();
    const segunda = crearRes();

    suscribir(20, primera);
    suscribir(21, segunda);

    assert.equal(emitirAVarios([20, 21, 20], 'feed', { motivo: 'prueba' }), 2);
    assert.equal(primera.escrituras.length, 1);
    assert.equal(segunda.escrituras.length, 1);
});

test('el registro limita las conexiones simultáneas por usuario', (t) => {
    t.after(cerrarTodos);

    const abiertas = [];

    for (let indice = 0; indice < MAXIMO_CONEXIONES_POR_USUARIO; indice += 1) {
        const res = crearRes();

        abiertas.push(res);
        assert.equal(suscribir(12, res), true);
    }

    const extra = crearRes();

    // El controlador consulta hayCupo() para responder 429 antes de los
    // encabezados SSE, y suscribir() vuelve a comprobarlo.
    assert.equal(hayCupo(12), false);
    assert.equal(suscribir(12, extra), false);
    assert.equal(contarSuscriptores(12), MAXIMO_CONEXIONES_POR_USUARIO);

    // Al liberar una conexión vuelve a haber cupo.
    desuscribir(12, abiertas[0]);
    assert.equal(hayCupo(12), true);
});

test('emitirA descarta las conexiones que ya no aceptan escrituras', (t) => {
    t.after(cerrarTodos);

    const cerrada = crearRes();

    suscribir(13, cerrada);
    cerrada.destroyed = true;

    assert.equal(emitirA(13, 'feed', { motivo: 'mensaje' }), 0);
    assert.equal(cerrada.escrituras.length, 0);
    // La conexión muerta se elimina para no acumular memoria.
    assert.equal(contarSuscriptores(13), 0);

    const rota = crearRes();

    rota.write = () => {
        throw new Error('socket cerrado');
    };

    suscribir(14, rota);

    assert.equal(emitirA(14, 'x', { a: 1 }), 0);
    assert.equal(contarSuscriptores(14), 0);
});

test('cerrarTodos cierra las conexiones y vacía el registro', (t) => {
    t.after(cerrarTodos);

    const primera = crearRes();
    const segunda = crearRes();

    suscribir(15, primera);
    suscribir(16, segunda);

    cerrarTodos();

    assert.equal(primera.cerrada, true);
    assert.equal(segunda.cerrada, true);
    assert.equal(contarUsuariosConectados(), 0);
    assert.equal(contarSuscriptores(15), 0);
});
