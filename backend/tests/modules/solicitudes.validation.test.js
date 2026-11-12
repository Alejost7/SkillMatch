// Pruebas de las validaciones del módulo de solicitudes de conexión.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarCrearSolicitud,
    validarFiltrosSolicitudes,
    validarIdSolicitud
} from '../../src/modules/solicitudes/solicitudes.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

// El middleware de autenticación guarda el usuario en req.usuario; las
// validaciones que dependen de él se prueban con este ayudante.
function crearReqConUsuario({
    body,
    params = {},
    query = {},
    idUsuario = 5
} = {}) {
    const req = crearReq({ body, params, query });
    req.usuario = { idUsuario };

    return req;
}

test('validarCrearSolicitud normaliza los datos válidos', () => {
    const req = crearReqConUsuario({
        body: {
            idUsuarioReceptor: '7',
            mensajeInicial: '  Hola, ¿te interesa intercambiar?  '
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearSolicitud, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.nuevaSolicitud, {
        idUsuarioReceptor: 7,
        mensajeInicial: 'Hola, ¿te interesa intercambiar?'
    });
});

test('validarCrearSolicitud rechaza un cuerpo que no es objeto', () => {
    for (const body of [undefined, null, [], 'texto', 42]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearSolicitud,
            crearReqConUsuario({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.equal(res.body.message, 'Debes enviar un objeto JSON.');
    }
});

test('validarCrearSolicitud no permite enviarse una solicitud a sí mismo', () => {
    const req = crearReqConUsuario({
        body: { idUsuarioReceptor: 5 },
        idUsuario: 5
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearSolicitud, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, [
        'No puedes enviarte una solicitud a ti mismo.'
    ]);
});

test('validarCrearSolicitud acumula los errores de datos inválidos', () => {
    const req = crearReqConUsuario({
        body: {
            idUsuarioReceptor: 'abc',
            mensajeInicial: 42,
            estado: 'pendiente'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearSolicitud, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 3);
    assert.ok(
        res.body.errors.some((error) =>
            /Campos no permitidos: estado/.test(error)
        )
    );
    assert.ok(res.body.errors.some((error) => /idUsuarioReceptor/.test(error)));
    assert.ok(
        res.body.errors.some((error) =>
            /mensaje inicial debe ser texto/.test(error)
        )
    );
});

test('validarCrearSolicitud convierte un mensaje vacío en null', () => {
    const req = crearReqConUsuario({
        body: { idUsuarioReceptor: 7, mensajeInicial: '   ' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearSolicitud, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.nuevaSolicitud, {
        idUsuarioReceptor: 7,
        mensajeInicial: null
    });
});

test('validarCrearSolicitud rechaza un mensaje inicial demasiado largo', () => {
    const req = crearReqConUsuario({
        body: { idUsuarioReceptor: 7, mensajeInicial: 'x'.repeat(501) }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearSolicitud, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(
        res.body.errors.some((error) => /máximo 500 caracteres/.test(error))
    );
});

test('validarFiltrosSolicitudes aplica los valores por defecto', () => {
    const req = crearReq({ query: {} });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosSolicitudes, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaSolicitudes, {
        filtros: { estado: undefined },
        pagina: 1,
        limite: 10,
        desplazamiento: 0
    });
});

test('validarFiltrosSolicitudes normaliza el estado y la paginación', () => {
    const req = crearReq({
        query: { estado: ' ACEPTADA ', page: '2', limit: '5' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosSolicitudes, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaSolicitudes, {
        filtros: { estado: 'aceptada' },
        pagina: 2,
        limite: 5,
        desplazamiento: 5
    });
});

test('validarFiltrosSolicitudes reporta filtros y paginación inválidos', () => {
    const req = crearReq({
        query: { estado: 'olvidada', page: '0', limit: '51' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosSolicitudes, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 3);
    assert.ok(res.body.errors.some((error) => /estado/.test(error)));
    assert.ok(res.body.errors.some((error) => /page/.test(error)));
    assert.ok(res.body.errors.some((error) => /limit/.test(error)));
});

test('validarIdSolicitud rechaza identificadores inválidos', () => {
    for (const id of ['abc', '0', '-1', '1.5', '']) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarIdSolicitud,
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

test('validarIdSolicitud guarda el identificador válido en res.locals', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdSolicitud,
        crearReq({ params: { id: '12' } }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idSolicitud, 12);
});
