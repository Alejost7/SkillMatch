// Pruebas de las validaciones del módulo de mensajería.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarCrearMensaje,
    validarFiltrosMensajes,
    validarMarcarLeidos
} from '../../src/modules/mensajes/mensajes.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

test('validarCrearMensaje normaliza la conexión y el contenido', () => {
    const req = crearReq({
        body: { idConexion: '7', contenido: '  Hola, ¿cómo estás?  ' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearMensaje, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.nuevoMensaje, {
        idConexion: 7,
        contenido: 'Hola, ¿cómo estás?'
    });
});

test('validarCrearMensaje exige un cuerpo JSON', () => {
    for (const body of [undefined, null, 'texto', ['idConexion']]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearMensaje,
            crearReq({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.body.errors, ['Debes enviar un objeto JSON.']);
    }
});

test('validarCrearMensaje reporta la conexión y el contenido inválidos', () => {
    const req = crearReq({ body: { idConexion: 'abc', contenido: '   ' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearMensaje, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, [
        'El campo idConexion debe ser un entero positivo válido.',
        'El campo contenido no puede estar vacío.'
    ]);
});

test('validarCrearMensaje valida el tipo y el largo del contenido', () => {
    const noTexto = crearRes();

    ejecutarMiddleware(
        validarCrearMensaje,
        crearReq({ body: { idConexion: 1, contenido: 42 } }),
        noTexto
    );

    assert.deepEqual(noTexto.body.errors, [
        'El campo contenido debe ser texto.'
    ]);

    const muyLargo = crearRes();

    ejecutarMiddleware(
        validarCrearMensaje,
        crearReq({ body: { idConexion: 1, contenido: 'x'.repeat(1001) } }),
        muyLargo
    );

    assert.deepEqual(muyLargo.body.errors, [
        'El campo contenido admite como máximo 1000 caracteres.'
    ]);
});

test('validarCrearMensaje rechaza campos no permitidos', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarCrearMensaje,
        crearReq({
            body: { idConexion: 1, contenido: 'Hola', leido: true }
        }),
        res
    );

    assert.equal(continuo, false);
    assert.deepEqual(res.body.errors, ['Campos no permitidos: leido.']);
});

test('validarFiltrosMensajes aplica los valores por defecto', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarFiltrosMensajes,
        crearReq({ query: {} }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaMensajes, {
        filtros: { idConexion: undefined },
        pagina: 1,
        limite: 10,
        desplazamiento: 0
    });
});

test('validarFiltrosMensajes normaliza la conexión y la paginación', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarFiltrosMensajes,
        crearReq({ query: { conexionId: '4', page: '2', limit: '5' } }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaMensajes, {
        filtros: { idConexion: 4 },
        pagina: 2,
        limite: 5,
        desplazamiento: 5
    });
});

test('validarFiltrosMensajes reporta filtros y paginación inválidos', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarFiltrosMensajes,
        crearReq({ query: { conexionId: '0', page: '0', limit: '500' } }),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 3);
    assert.ok(res.body.errors.some((error) => /conexionId/.test(error)));
    assert.ok(res.body.errors.some((error) => /page/.test(error)));
    assert.ok(res.body.errors.some((error) => /limit/.test(error)));
});

test('validarMarcarLeidos exige una conexión válida', () => {
    for (const body of [{}, { idConexion: 'abc' }]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarMarcarLeidos,
            crearReq({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.deepEqual(res.body.errors, [
            'El campo idConexion debe ser un entero positivo válido.'
        ]);
    }
});

test('validarMarcarLeidos guarda la conexión válida', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarMarcarLeidos,
        crearReq({ body: { idConexion: '3' } }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.marcarLeidos, { idConexion: 3 });
});
