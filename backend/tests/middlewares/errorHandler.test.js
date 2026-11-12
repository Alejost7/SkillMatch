// Pruebas del manejador central de errores.

import assert from 'node:assert/strict';
import test from 'node:test';

import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { crearReq, crearRes, crearSiguiente } from '../helpers/fakes.js';

// Ejecuta el handler sin dejar ruido de errores en la salida de las pruebas.
function manejar(error, res) {
    const original = console.error;

    console.error = () => {};

    try {
        const siguiente = crearSiguiente();

        errorHandler(error, crearReq(), res, siguiente);

        return siguiente;
    } finally {
        console.error = original;
    }
}

test('responde 400 cuando el cuerpo no es JSON válido', () => {
    const res = crearRes();
    const error = Object.assign(new Error('Fallo al analizar el JSON'), {
        type: 'entity.parse.failed'
    });

    manejar(error, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /JSON inválido/);
});

test('propaga el mensaje de un error 404', () => {
    const res = crearRes();
    const error = Object.assign(new Error('Recurso no encontrado'), {
        status: 404
    });

    manejar(error, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'Recurso no encontrado');
});

test('propaga el mensaje de un error 409', () => {
    const res = crearRes();
    const error = Object.assign(new Error('El alias ya está en uso.'), {
        status: 409
    });

    manejar(error, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.message, 'El alias ya está en uso.');
});

test('oculta el detalle de otros errores 4xx', () => {
    const res = crearRes();
    const error = Object.assign(new Error('Detalle interno del filtro'), {
        status: 400
    });

    manejar(error, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Uy! No se pudo procesar la petición.');
    assert.ok(!res.body.message.includes('Detalle interno'));
});

test('responde 500 cuando el error no trae estado', () => {
    const res = crearRes();

    manejar(new Error('Fallo inesperado'), res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(
        res.body.message,
        'Lamentablemente, ocurrió un error interno en el servidor, :(.'
    );
});

test('responde 500 cuando el estado es explícitamente 500', () => {
    const res = crearRes();
    const error = Object.assign(new Error('Fallo de base de datos'), {
        status: 500
    });

    manejar(error, res);

    assert.equal(res.statusCode, 500);
    assert.ok(!res.body.message.includes('base de datos'));
});

test('delega en next si la respuesta ya fue enviada', () => {
    const res = crearRes();
    res.headersSent = true;

    const error = new Error('Fallo posterior al envío');
    const siguiente = manejar(error, res);

    assert.equal(siguiente.llamado, true);
    assert.equal(siguiente.argumento, error);
    assert.equal(res.statusCode, null);
});
