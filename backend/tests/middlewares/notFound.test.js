// Pruebas del middleware que responde a rutas inexistentes.

import assert from 'node:assert/strict';
import test from 'node:test';

import { notFound } from '../../src/middlewares/notFound.js';
import { crearReq, crearRes } from '../helpers/fakes.js';

test('responde 404 con un mensaje claro', () => {
    const res = crearRes();

    notFound(crearReq(), res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /la ruta solicitada no existe/);
});
