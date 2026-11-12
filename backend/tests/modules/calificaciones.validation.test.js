// Pruebas de las validaciones del módulo de calificaciones.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarCrearCalificacion,
    validarIdUsuarioCalificado,
    validarIdConexionCalificacion,
    validarPaginacionCalificaciones
} from '../../src/modules/calificaciones/calificaciones.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

test('validarCrearCalificacion normaliza la conexión y el comentario', () => {
    const req = crearReq({
        body: {
            idConexion: '9',
            puntuacion: '4',
            comentario: '  Muy buen intercambio.  '
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearCalificacion, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.nuevaCalificacion, {
        idConexion: 9,
        puntuacion: 4,
        comentario: 'Muy buen intercambio.'
    });
});

test('validarCrearCalificacion acepta un comentario vacío como nulo', () => {
    for (const comentario of ['', '   ', null]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearCalificacion,
            crearReq({ body: { idConexion: 2, puntuacion: 5, comentario } }),
            res
        );

        assert.equal(continuo, true);
        assert.equal(res.locals.nuevaCalificacion.comentario, null);
    }
});

test('validarCrearCalificacion omite el comentario cuando no se envía', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarCrearCalificacion,
        crearReq({ body: { idConexion: 2, puntuacion: 3 } }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.nuevaCalificacion, {
        idConexion: 2,
        puntuacion: 3
    });
});

test('validarCrearCalificacion reporta la conexión y la puntuación inválidas', () => {
    const req = crearReq({ body: { idConexion: 'abc', puntuacion: 6 } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearCalificacion, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, [
        'El campo idConexion debe ser un entero positivo válido.',
        'El campo puntuacion debe ser un entero entre 1 y 5.'
    ]);
});

test('validarCrearCalificacion rechaza puntuaciones fuera de rango', () => {
    for (const puntuacion of [0, 7, 2.5, 'alta', undefined]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearCalificacion,
            crearReq({ body: { idConexion: 1, puntuacion } }),
            res
        );

        assert.equal(continuo, false);
        assert.deepEqual(res.body.errors, [
            'El campo puntuacion debe ser un entero entre 1 y 5.'
        ]);
    }
});

test('validarCrearCalificacion valida el tipo y el largo del comentario', () => {
    const noTexto = crearRes();

    ejecutarMiddleware(
        validarCrearCalificacion,
        crearReq({ body: { idConexion: 1, puntuacion: 5, comentario: 42 } }),
        noTexto
    );

    assert.deepEqual(noTexto.body.errors, [
        'El campo comentario debe ser texto.'
    ]);

    const muyLargo = crearRes();

    ejecutarMiddleware(
        validarCrearCalificacion,
        crearReq({
            body: {
                idConexion: 1,
                puntuacion: 5,
                comentario: 'x'.repeat(501)
            }
        }),
        muyLargo
    );

    assert.deepEqual(muyLargo.body.errors, [
        'El campo comentario admite como máximo 500 caracteres.'
    ]);
});

test('validarCrearCalificacion rechaza el calificado enviado por el cliente', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarCrearCalificacion,
        crearReq({
            body: { idConexion: 1, puntuacion: 5, idCalificado: 8 }
        }),
        res
    );

    assert.equal(continuo, false);
    assert.deepEqual(res.body.errors, [
        'Campos no permitidos: idCalificado.'
    ]);
});

test('validarCrearCalificacion exige un cuerpo JSON', () => {
    for (const body of [undefined, null, 'texto', ['idConexion']]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearCalificacion,
            crearReq({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.equal(res.body.message, 'Debes enviar un objeto JSON.');
    }
});


test('validarIdUsuarioCalificado rechaza identificadores inválidos', () => {
    for (const id of ['abc', '0', '-2', '3.5', '']) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarIdUsuarioCalificado,
            crearReq({ params: { id } }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.equal(
            res.body.message,
            'El identificador debe ser un entero positivo válido.'
        );
    }
});

test('validarIdUsuarioCalificado guarda el identificador válido', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdUsuarioCalificado,
        crearReq({ params: { id: '12' } }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idUsuarioCalificado, 12);
});

test('validarIdConexionCalificacion guarda el identificador válido', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdConexionCalificacion,
        crearReq({ params: { id: '5' } }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idConexionCalificacion, 5);
});

test('validarPaginacionCalificaciones aplica los valores por defecto', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarPaginacionCalificaciones,
        crearReq({ query: {} }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaCalificaciones, {
        pagina: 1,
        limite: 10,
        desplazamiento: 0
    });
});

test('validarPaginacionCalificaciones normaliza page y limit', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarPaginacionCalificaciones,
        crearReq({ query: { page: '2', limit: '5' } }),
        res
    );

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaCalificaciones, {
        pagina: 2,
        limite: 5,
        desplazamiento: 5
    });
});

test('validarPaginacionCalificaciones reporta valores inválidos', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarPaginacionCalificaciones,
        crearReq({ query: { page: '0', limit: '51' } }),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 2);
    assert.ok(res.body.errors.some((error) => /page/.test(error)));
    assert.ok(res.body.errors.some((error) => /limit/.test(error)));
});
