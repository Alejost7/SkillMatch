// Pruebas de las validaciones del módulo de conexiones.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarFiltrosConexiones,
    validarIdConexion
} from '../../src/modules/conexiones/conexiones.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

test('validarFiltrosConexiones aplica los valores por defecto', () => {
    const req = crearReq({ query: {} });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosConexiones, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaConexiones, {
        filtros: { estado: undefined },
        pagina: 1,
        limite: 10,
        desplazamiento: 0
    });
});

test('validarFiltrosConexiones normaliza el estado y la paginación', () => {
    const req = crearReq({
        query: { estado: ' Activa ', page: '3', limit: '20' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosConexiones, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.busquedaConexiones, {
        filtros: { estado: 'activa' },
        pagina: 3,
        limite: 20,
        desplazamiento: 40
    });
});

test('validarFiltrosConexiones reporta filtros y paginación inválidos', () => {
    const req = crearReq({
        query: { estado: 'pendiente', page: 'abc', limit: '0' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarFiltrosConexiones, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 3);
    assert.ok(res.body.errors.some((error) => /estado/.test(error)));
    assert.ok(res.body.errors.some((error) => /page/.test(error)));
    assert.ok(res.body.errors.some((error) => /limit/.test(error)));
});

test('validarIdConexion rechaza identificadores inválidos', () => {
    for (const id of ['abc', '0', '-3', '2.5', '']) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarIdConexion,
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

test('validarIdConexion guarda el identificador válido en res.locals', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdConexion,
        crearReq({ params: { id: '8' } }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idConexion, 8);
});
