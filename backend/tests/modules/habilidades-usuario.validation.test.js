// Pruebas de las validaciones del módulo de habilidades del usuario.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarActualizarOfrecida,
    validarActualizarRequerida,
    validarCrearOfrecida,
    validarCrearRequerida,
    validarIdOfrecida,
    validarIdRequerida
} from '../../src/modules/habilidades-usuario/habilidades-usuario.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

test('validarCrearOfrecida normaliza los datos válidos', () => {
    const req = crearReq({
        body: {
            idHabilidad: 3,
            nivel: ' Avanzado ',
            descripcionApoyo: '  Clases de guitarra los sábados  '
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearOfrecida, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.ofrecida, {
        idHabilidad: 3,
        nivel: 'avanzado',
        descripcionApoyo: 'Clases de guitarra los sábados',
        estado: 'activo'
    });
});

test('validarCrearOfrecida rechaza un cuerpo que no es objeto', () => {
    for (const body of [undefined, null, [], 'texto', 42]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarCrearOfrecida,
            crearReq({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.equal(res.body.message, 'Debes enviar un objeto JSON.');
    }
});

test('validarCrearOfrecida acumula los errores de datos inválidos', () => {
    const req = crearReq({
        body: {
            idHabilidad: 'abc',
            nivel: 'experto',
            descripcionApoyo: 42,
            estado: 'borrador',
            idioma: 'es'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearOfrecida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 5);
    assert.ok(
        res.body.errors.some((error) =>
            /Campos no permitidos: idioma/.test(error)
        )
    );
    assert.ok(res.body.errors.some((error) => /idHabilidad/.test(error)));
    assert.ok(res.body.errors.some((error) => /El nivel debe ser/.test(error)));
    assert.ok(
        res.body.errors.some((error) => /descripción de apoyo/.test(error))
    );
    assert.ok(res.body.errors.some((error) => /El estado debe ser/.test(error)));
});

test('validarCrearOfrecida exige el nivel', () => {
    const req = crearReq({ body: { idHabilidad: 1 } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearOfrecida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.errors.some((error) => /El nivel debe ser/.test(error)));
});

test('validarActualizarOfrecida exige al menos un campo', () => {
    const req = crearReq({ body: {} });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarOfrecida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, [
        'Debes enviar al menos un campo para actualizar.'
    ]);
});

test('validarActualizarOfrecida acepta cambios parciales', () => {
    const req = crearReq({ body: { nivel: 'BASICO' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarOfrecida, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.ofrecida, { nivel: 'basico' });
});

test('validarActualizarOfrecida limpia la descripción con null', () => {
    const req = crearReq({ body: { descripcionApoyo: null } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarOfrecida, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.ofrecida, { descripcionApoyo: null });
});

test('validarActualizarOfrecida rechaza campos desconocidos', () => {
    const req = crearReq({ body: { idUsuario: 5 } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarOfrecida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.body.errors.length, 1);
    assert.match(res.body.errors[0], /Campos no permitidos: idUsuario/);
});

test('validarCrearRequerida acepta solo la habilidad', () => {
    const req = crearReq({ body: { idHabilidad: 2 } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearRequerida, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.requerida, {
        idHabilidad: 2,
        estado: 'activo'
    });
});

test('validarCrearRequerida exige el idHabilidad', () => {
    const req = crearReq({ body: { objetivoAprendizaje: 'Aprender SQL' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearRequerida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.errors.some((error) => /idHabilidad/.test(error)));
});

test('validarCrearRequerida rechaza un nivel deseado inválido', () => {
    const req = crearReq({ body: { idHabilidad: 2, nivelDeseado: 'maestro' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearRequerida, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(
        res.body.errors.some((error) => /nivel deseado debe ser/.test(error))
    );
});

test('validarActualizarRequerida normaliza y permite limpiar campos', () => {
    const req = crearReq({
        body: {
            nivelDeseado: '   ',
            objetivoAprendizaje: '  Aprender SQL avanzado  '
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarRequerida, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.requerida, {
        nivelDeseado: null,
        objetivoAprendizaje: 'Aprender SQL avanzado'
    });
});

test('validarIdOfrecida guarda el identificador válido', () => {
    const req = crearReq({ params: { id: '7' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarIdOfrecida, req, res);

    assert.equal(continuo, true);
    assert.equal(res.locals.idHabilidadOfrecida, 7);
});

test('validarIdRequerida rechaza identificadores inválidos', () => {
    for (const valor of ['0', 'abc', '1.5', '-3', '99999999999']) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarIdRequerida,
            crearReq({ params: { id: valor } }),
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
