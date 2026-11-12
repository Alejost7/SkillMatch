// Pruebas del middleware de autenticación y de la autorización por rol.

import assert from 'node:assert/strict';
import test from 'node:test';

import jwt from 'jsonwebtoken';

import { env } from '../../src/config/env.js';
import {
    autenticar,
    autorizarAdministrador
} from '../../src/middlewares/autenticacion.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

const PAYLOAD_BASE = Object.freeze({
    idUsuario: 7,
    idRol: 1,
    rol: 'usuario',
    correoElectronico: 'ana@example.com'
});

function firmar(payload = PAYLOAD_BASE, opciones = {}) {
    return jwt.sign(payload, opciones.secret ?? env.jwt.secret, {
        algorithm: 'HS256',
        expiresIn: opciones.expiresIn ?? '1h'
    });
}

function peticionConToken(token) {
    return crearReq({ headers: { authorization: `Bearer ${token}` } });
}

// Codifica un objeto como base64url, para construir tokens a mano.
function codificar(objeto) {
    return Buffer.from(JSON.stringify(objeto)).toString('base64url');
}

test('rechaza la petición cuando no se envía el header Authorization', () => {
    const req = crearReq();
    const res = crearRes();

    const continuo = ejecutarMiddleware(autenticar, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(
        res.body.message,
        'No se proporcionó un token de autenticación.'
    );
});

test('rechaza un formato distinto de "Bearer <token>"', () => {
    const formatosInvalidos = [
        'Bearer',
        'Basic abc123',
        'Bearer token extra',
        'bearer abc123'
    ];

    for (const authorization of formatosInvalidos) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            autenticar,
            crearReq({ headers: { authorization } }),
            res
        );

        assert.equal(
            continuo,
            false,
            `Formato aceptado por error: ${authorization}`
        );
        assert.equal(res.statusCode, 401);
        assert.match(res.body.message, /formato del token no es válido/);
    }
});

test('acepta un token válido y guarda el usuario en req.usuario', () => {
    const req = peticionConToken(firmar());
    const res = crearRes();

    const continuo = ejecutarMiddleware(autenticar, req, res);

    assert.equal(continuo, true);
    assert.equal(res.statusCode, null);
    assert.deepEqual(req.usuario, {
        idUsuario: 7,
        idRol: 1,
        rol: 'usuario',
        correoElectronico: 'ana@example.com'
    });
});

test('conserva el rol administrador en req.usuario', () => {
    const req = peticionConToken(
        firmar({ ...PAYLOAD_BASE, idRol: 2, rol: 'administrador' })
    );

    ejecutarMiddleware(autenticar, req, crearRes());

    assert.equal(req.usuario.rol, 'administrador');
    assert.equal(req.usuario.idRol, 2);
});

test('rechaza un token firmado con otro secreto', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        autenticar,
        peticionConToken(
            firmar(PAYLOAD_BASE, { secret: 'otro-secreto-distinto' })
        ),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Token inválido o expirado.');
});

test('rechaza un token expirado', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        autenticar,
        peticionConToken(firmar(PAYLOAD_BASE, { expiresIn: '-10s' })),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Token inválido o expirado.');
});

test('rechaza un token sin firma (alg: none)', () => {
    const tokenSinFirma = [
        codificar({ alg: 'none', typ: 'JWT' }),
        codificar(PAYLOAD_BASE),
        ''
    ].join('.');

    const res = crearRes();

    const continuo = ejecutarMiddleware(
        autenticar,
        peticionConToken(tokenSinFirma),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Token inválido o expirado.');
});

test('rechaza un token con un idUsuario inválido', () => {
    for (const idUsuario of ['abc', 0, -3, null, 1.5]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            autenticar,
            peticionConToken(firmar({ ...PAYLOAD_BASE, idUsuario })),
            res
        );

        assert.equal(continuo, false, `Se aceptó idUsuario=${idUsuario}`);
        assert.equal(res.statusCode, 401);
        assert.equal(res.body.message, 'Token inválido o expirado.');
    }
});

test('autorizarAdministrador exige un usuario autenticado', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        autorizarAdministrador,
        crearReq(),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /Debes iniciar sesión/);
});

test('autorizarAdministrador rechaza a un usuario normal', () => {
    const req = crearReq();
    req.usuario = { idUsuario: 7, idRol: 1, rol: 'usuario' };

    const res = crearRes();

    const continuo = ejecutarMiddleware(autorizarAdministrador, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 403);
    assert.equal(
        res.body.message,
        'No tienes permisos para realizar esta acción.'
    );
});

test('autorizarAdministrador acepta el rol por nombre', () => {
    const req = crearReq();
    req.usuario = { idUsuario: 9, idRol: 5, rol: 'administrador' };

    const continuo = ejecutarMiddleware(
        autorizarAdministrador,
        req,
        crearRes()
    );

    assert.equal(continuo, true);
});

test('autorizarAdministrador acepta el id documentado de administrador', () => {
    const req = crearReq();
    req.usuario = { idUsuario: 9, idRol: 2, rol: null };

    const continuo = ejecutarMiddleware(
        autorizarAdministrador,
        req,
        crearRes()
    );

    assert.equal(continuo, true);
});

test('autorizarAdministrador rechaza un rol desconocido', () => {
    const req = crearReq();
    req.usuario = { idUsuario: 9, idRol: 3, rol: 'moderador' };

    const res = crearRes();

    const continuo = ejecutarMiddleware(autorizarAdministrador, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 403);
});

