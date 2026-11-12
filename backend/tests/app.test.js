// Pruebas de integración de la aplicación Express.
//
// Se levanta el servidor en un puerto libre y se hacen peticiones HTTP reales.
// Todas las rutas usadas aquí se resuelven sin consultar la base de datos:
// solo se ejercitan validaciones, autenticación y el manejo de errores.

import assert from 'node:assert/strict';
import { once } from 'node:events';
import test, { after, before } from 'node:test';

const { default: app } = await import('../src/app.js');
const { pool } = await import('../src/config/database.js');
const { default: jwt } = await import('jsonwebtoken');
const { env } = await import('../src/config/env.js');

// Firma un token válido para ejercitar las rutas protegidas.
function firmarToken({ idRol, rol }) {
    return jwt.sign(
        {
            idUsuario: 99,
            idRol,
            rol,
            correoElectronico: 'pruebas@example.com'
        },
        env.jwt.secret,
        { algorithm: 'HS256', expiresIn: '1h' }
    );
}

// Token de un usuario normal: no puede modificar el catálogo.
const TOKEN_USUARIO = firmarToken({ idRol: 1, rol: 'usuario' });

// Token de un administrador: sí puede modificar el catálogo.
const TOKEN_ADMIN = firmarToken({ idRol: 2, rol: 'administrador' });

// Envía un JSON con el encabezado Authorization ya preparado.
function pedirConToken(ruta, metodo, token, cuerpo) {
    return pedir(ruta, {
        method: metodo,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cuerpo ?? {})
    });
}

let servidor;
let urlBase;

before(async () => {
    servidor = app.listen(0, '127.0.0.1');
    await once(servidor, 'listening');

    urlBase = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
    const cerrado = once(servidor, 'close');

    servidor.close();
    servidor.closeIdleConnections?.();
    await cerrado;

    await pool.end();
});

// Envía una petición y devuelve el estado y el cuerpo ya interpretados.
async function pedir(ruta, opciones = {}) {
    const respuesta = await fetch(`${urlBase}${ruta}`, opciones);

    return {
        estado: respuesta.status,
        encabezados: respuesta.headers,
        cuerpo: await respuesta.json()
    };
}

test('GET /api/health responde 200', async () => {
    const { estado, cuerpo, encabezados } = await pedir('/api/health');

    assert.equal(estado, 200);
    assert.equal(cuerpo.success, true);
    assert.equal(encabezados.get('x-powered-by'), null);
});

test('una ruta inexistente responde 404', async () => {
    const { estado, cuerpo } = await pedir('/api/ruta-que-no-existe');

    assert.equal(estado, 404);
    assert.equal(cuerpo.success, false);
    assert.match(cuerpo.message, /la ruta solicitada no existe/);
});

test('GET /api/usuarios/perfil responde 401 sin token', async () => {
    const { estado, cuerpo } = await pedir('/api/usuarios/perfil');

    assert.equal(estado, 401);
    assert.equal(cuerpo.success, false);
    assert.equal(
        cuerpo.message,
        'No se proporcionó un token de autenticación.'
    );
});

test('GET /api/usuarios/perfil responde 401 con un token inválido', async () => {
    const { estado, cuerpo } = await pedir('/api/usuarios/perfil', {
        headers: { authorization: 'Bearer token-invalido' }
    });

    assert.equal(estado, 401);
    assert.equal(cuerpo.message, 'Token inválido o expirado.');
});

test('POST /api/auth/login valida los campos obligatorios', async () => {
    const { estado, cuerpo } = await pedir('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    });

    assert.equal(estado, 400);
    assert.equal(cuerpo.success, false);
    assert.equal(cuerpo.errors.length, 2);
    assert.ok(cuerpo.errors.some((error) => /correo electrónico/.test(error)));
    assert.ok(cuerpo.errors.some((error) => /contraseña/.test(error)));
});

test('POST /api/auth/login responde 400 con JSON inválido', async () => {
    const { estado, cuerpo } = await pedir('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ esto no es json'
    });

    assert.equal(estado, 400);
    assert.equal(cuerpo.success, false);
    assert.match(cuerpo.message, /JSON inválido/);
});

test('POST /api/auth/login exige un objeto JSON', async () => {
    const { estado, cuerpo } = await pedir('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '[]'
    });

    assert.equal(estado, 400);
    assert.equal(cuerpo.message, 'Debes enviar un objeto JSON.');
});

test('GET /api/habilidades valida el filtro categoriaId', async () => {
    const { estado, cuerpo } = await pedir(
        '/api/habilidades?categoriaId=abc'
    );

    assert.equal(estado, 400);
    assert.equal(cuerpo.success, false);
    assert.ok(cuerpo.errors.some((error) => /categoriaId/.test(error)));
});

test('GET /api/habilidades/:id valida el identificador', async () => {
    const { estado, cuerpo } = await pedir('/api/habilidades/abc');

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('GET /api/usuarios/:id valida el identificador', async () => {
    const { estado, cuerpo } = await pedir('/api/usuarios/0');

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('POST /api/habilidades valida los datos enviados', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/habilidades',
        'POST',
        TOKEN_ADMIN
    );

    assert.equal(estado, 400);
    assert.equal(cuerpo.success, false);
    assert.ok(cuerpo.errors.some((error) => /idCategoria/.test(error)));
    assert.ok(cuerpo.errors.some((error) => /nombre/.test(error)));
});

test('POST /api/categorias responde 401 sin token', async () => {
    const { estado, cuerpo } = await pedir('/api/categorias', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombre: 'Nueva' })
    });

    assert.equal(estado, 401);
    assert.equal(
        cuerpo.message,
        'No se proporcionó un token de autenticación.'
    );
});

test('POST /api/categorias responde 403 a un usuario normal', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/categorias',
        'POST',
        TOKEN_USUARIO,
        { nombre: 'Nueva' }
    );

    assert.equal(estado, 403);
    assert.equal(
        cuerpo.message,
        'No tienes permisos para realizar esta acción.'
    );
});

test('PUT /api/habilidades/1 responde 401 sin token', async () => {
    const { estado, cuerpo } = await pedir('/api/habilidades/1', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    });

    assert.equal(estado, 401);
    assert.equal(
        cuerpo.message,
        'No se proporcionó un token de autenticación.'
    );
});

test('DELETE /api/categorias/1 responde 403 a un usuario normal', async () => {
    const { estado } = await pedir('/api/categorias/1', {
        method: 'DELETE',
        headers: { authorization: `Bearer ${TOKEN_USUARIO}` }
    });

    assert.equal(estado, 403);
});

test('POST /api/categorias valida los datos con un administrador', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/categorias',
        'POST',
        TOKEN_ADMIN,
        { nombre: '   ' }
    );

    assert.equal(estado, 400);
    assert.ok(cuerpo.errors.some((error) => /nombre/.test(error)));
});

test('DELETE /api/categorias/abc responde 400 con un administrador', async () => {
    const { estado, cuerpo } = await pedir('/api/categorias/abc', {
        method: 'DELETE',
        headers: { authorization: `Bearer ${TOKEN_ADMIN}` }
    });

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('PUT /api/usuarios/perfil exige token y valida los datos', async () => {
    const sinToken = await pedir('/api/usuarios/perfil', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nombres: 'Ana', apellidos: 'Gómez' })
    });

    assert.equal(sinToken.estado, 401);

    const conToken = await pedirConToken(
        '/api/usuarios/perfil',
        'PUT',
        TOKEN_USUARIO,
        {
            nombres: 'Ana',
            apellidos: 'Gómez',
            biografia: 'x'.repeat(1001),
            fotoPerfilUrl: 'esto-no-es-una-url'
        }
    );

    assert.equal(conToken.estado, 400);
    assert.equal(conToken.cuerpo.errors.length, 2);
});
test('las rutas de habilidades del usuario exigen un token', async () => {
    const rutas = [
        ['GET', '/api/habilidades-usuario/ofrecidas'],
        ['POST', '/api/habilidades-usuario/ofrecidas'],
        ['PUT', '/api/habilidades-usuario/ofrecidas/1'],
        ['DELETE', '/api/habilidades-usuario/ofrecidas/1'],
        ['GET', '/api/habilidades-usuario/requeridas'],
        ['POST', '/api/habilidades-usuario/requeridas'],
        ['PUT', '/api/habilidades-usuario/requeridas/1'],
        ['DELETE', '/api/habilidades-usuario/requeridas/1']
    ];

    for (const [metodo, ruta] of rutas) {
        const opciones = {
            method: metodo,
            headers: { 'content-type': 'application/json' }
        };

        // GET no admite cuerpo, los demás métodos sí.
        if (metodo !== 'GET') {
            opciones.body = JSON.stringify({});
        }

        const { estado, cuerpo } = await pedir(ruta, opciones);

        assert.equal(estado, 401, `${metodo} ${ruta} debe responder 401`);
        assert.equal(
            cuerpo.message,
            'No se proporcionó un token de autenticación.'
        );
    }
});

test('POST /api/habilidades-usuario/ofrecidas valida los datos con token', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/habilidades-usuario/ofrecidas',
        'POST',
        TOKEN_USUARIO,
        { idHabilidad: 1 }
    );

    assert.equal(estado, 400);
    assert.ok(cuerpo.errors.some((error) => /El nivel debe ser/.test(error)));
});

test('PUT /api/habilidades-usuario/requeridas/abc responde 400 con token', async () => {
    const { estado, cuerpo } = await pedir(
        '/api/habilidades-usuario/requeridas/abc',
        {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${TOKEN_USUARIO}`
            },
            body: JSON.stringify({ nivelDeseado: 'basico' })
        }
    );

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('PUT /api/habilidades-usuario/ofrecidas/1 exige al menos un campo', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/habilidades-usuario/ofrecidas/1',
        'PUT',
        TOKEN_USUARIO,
        {}
    );

    assert.equal(estado, 400);
    assert.deepEqual(cuerpo.errors, [
        'Debes enviar al menos un campo para actualizar.'
    ]);
});

test('GET /api/habilidades valida la paginación y los filtros', async () => {
    const page = await pedir('/api/habilidades?page=0');

    assert.equal(page.estado, 400);
    assert.ok(page.cuerpo.errors.some((error) => /page/.test(error)));

    const limit = await pedir('/api/habilidades?limit=51');

    assert.equal(limit.estado, 400);
    assert.ok(limit.cuerpo.errors.some((error) => /limit/.test(error)));

    const estado = await pedir('/api/habilidades?estado=borrado');

    assert.equal(estado.estado, 400);
    assert.ok(estado.cuerpo.errors.some((error) => /estado/.test(error)));

    const orden = await pedir('/api/habilidades?orden=precio');

    assert.equal(orden.estado, 400);
    assert.ok(orden.cuerpo.errors.some((error) => /orden/.test(error)));
});

test('GET /api/usuarios valida los filtros y la paginación', async () => {
    const page = await pedir('/api/usuarios?page=abc');

    assert.equal(page.estado, 400);
    assert.ok(page.cuerpo.errors.some((error) => /page/.test(error)));

    const nombre = await pedir(`/api/usuarios?nombre=${'x'.repeat(101)}`);

    assert.equal(nombre.estado, 400);
    assert.ok(nombre.cuerpo.errors.some((error) => /nombre/.test(error)));

    const habilidad = await pedir(
        `/api/usuarios?habilidadOfrecida=${'x'.repeat(101)}`
    );

    assert.equal(habilidad.estado, 400);
    assert.ok(
        habilidad.cuerpo.errors.some((error) => /habilidadOfrecida/.test(error))
    );
});

test('las rutas de solicitudes y conexiones están protegidas', async () => {
    const rutas = [
        ['POST', '/api/solicitudes'],
        ['GET', '/api/solicitudes/recibidas'],
        ['GET', '/api/solicitudes/enviadas'],
        ['GET', '/api/solicitudes/1'],
        ['PATCH', '/api/solicitudes/1/aceptar'],
        ['PATCH', '/api/solicitudes/1/rechazar'],
        ['PATCH', '/api/solicitudes/1/cancelar'],
        ['GET', '/api/conexiones'],
        ['GET', '/api/conexiones/1'],
        ['PATCH', '/api/conexiones/1/finalizar']
    ];

    for (const [metodo, ruta] of rutas) {
        const opciones = {
            method: metodo,
            headers: { 'content-type': 'application/json' }
        };

        // GET no admite cuerpo, los demás métodos sí.
        if (metodo !== 'GET') {
            opciones.body = JSON.stringify({});
        }

        const { estado, cuerpo } = await pedir(ruta, opciones);

        assert.equal(estado, 401, `${metodo} ${ruta} debe responder 401`);
        assert.equal(
            cuerpo.message,
            'No se proporcionó un token de autenticación.'
        );
    }
});

test('POST /api/solicitudes valida el receptor y el mensaje', async () => {
    const sinReceptor = await pedirConToken(
        '/api/solicitudes',
        'POST',
        TOKEN_USUARIO,
        {}
    );

    assert.equal(sinReceptor.estado, 400);
    assert.ok(
        sinReceptor.cuerpo.errors.some((error) =>
            /idUsuarioReceptor/.test(error)
        )
    );

    // El token de pruebas identifica al usuario 99.
    const aSiMismo = await pedirConToken(
        '/api/solicitudes',
        'POST',
        TOKEN_USUARIO,
        { idUsuarioReceptor: 99 }
    );

    assert.equal(aSiMismo.estado, 400);
    assert.deepEqual(aSiMismo.cuerpo.errors, [
        'No puedes enviarte una solicitud a ti mismo.'
    ]);

    const invalida = await pedirConToken(
        '/api/solicitudes',
        'POST',
        TOKEN_USUARIO,
        {
            idUsuarioReceptor: 5,
            mensajeInicial: 'x'.repeat(501),
            estado: 'pendiente'
        }
    );

    assert.equal(invalida.estado, 400);
    assert.equal(invalida.cuerpo.errors.length, 2);
});

test('GET /api/solicitudes/recibidas valida el filtro de estado', async () => {
    const { estado, cuerpo } = await pedir(
        '/api/solicitudes/recibidas?estado=olvidada',
        { headers: { authorization: `Bearer ${TOKEN_USUARIO}` } }
    );

    assert.equal(estado, 400);
    assert.ok(cuerpo.errors.some((error) => /estado/.test(error)));
});

test('PATCH /api/solicitudes/abc/aceptar responde 400 con token', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/solicitudes/abc/aceptar',
        'PATCH',
        TOKEN_USUARIO,
        {}
    );

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('GET /api/conexiones valida los filtros y la paginación', async () => {
    const { estado, cuerpo } = await pedir(
        '/api/conexiones?estado=otro&limit=100',
        { headers: { authorization: `Bearer ${TOKEN_USUARIO}` } }
    );

    assert.equal(estado, 400);
    assert.equal(cuerpo.errors.length, 2);
    assert.ok(cuerpo.errors.some((error) => /estado/.test(error)));
    assert.ok(cuerpo.errors.some((error) => /limit/.test(error)));
});

test('GET /api/conexiones/abc responde 400 con token', async () => {
    const { estado, cuerpo } = await pedir('/api/conexiones/abc', {
        headers: { authorization: `Bearer ${TOKEN_USUARIO}` }
    });

    assert.equal(estado, 400);
    assert.equal(
        cuerpo.message,
        'El identificador debe ser un entero positivo válido.'
    );
});

test('las rutas de mensajes están protegidas', async () => {
    const rutas = [
        ['GET', '/api/mensajes'],
        ['GET', '/api/mensajes/no-leidos'],
        ['POST', '/api/mensajes'],
        ['PATCH', '/api/mensajes/leidos']
    ];

    for (const [metodo, ruta] of rutas) {
        const opciones = {
            method: metodo,
            headers: { 'content-type': 'application/json' }
        };

        // GET no admite cuerpo, los demás métodos sí.
        if (metodo !== 'GET') {
            opciones.body = JSON.stringify({});
        }

        const { estado, cuerpo } = await pedir(ruta, opciones);

        assert.equal(estado, 401, `${metodo} ${ruta} debe responder 401`);
        assert.equal(
            cuerpo.message,
            'No se proporcionó un token de autenticación.'
        );
    }
});

test('POST /api/mensajes valida la conexión y el contenido', async () => {
    const vacio = await pedirConToken(
        '/api/mensajes',
        'POST',
        TOKEN_USUARIO,
        {}
    );

    assert.equal(vacio.estado, 400);
    assert.equal(vacio.cuerpo.errors.length, 2);

    const muyLargo = await pedirConToken(
        '/api/mensajes',
        'POST',
        TOKEN_USUARIO,
        { idConexion: 3, contenido: 'x'.repeat(1001) }
    );

    assert.equal(muyLargo.estado, 400);
    assert.deepEqual(muyLargo.cuerpo.errors, [
        'El campo contenido admite como máximo 1000 caracteres.'
    ]);
});

test('GET /api/mensajes valida los filtros y la paginación', async () => {
    const { estado, cuerpo } = await pedir(
        '/api/mensajes?conexionId=abc&limit=80',
        { headers: { authorization: `Bearer ${TOKEN_USUARIO}` } }
    );

    assert.equal(estado, 400);
    assert.equal(cuerpo.errors.length, 2);
    assert.ok(cuerpo.errors.some((error) => /conexionId/.test(error)));
    assert.ok(cuerpo.errors.some((error) => /limit/.test(error)));
});

test('PATCH /api/mensajes/leidos exige la conexión', async () => {
    const { estado, cuerpo } = await pedirConToken(
        '/api/mensajes/leidos',
        'PATCH',
        TOKEN_USUARIO,
        {}
    );

    assert.equal(estado, 400);
    assert.deepEqual(cuerpo.errors, [
        'El campo idConexion debe ser un entero positivo válido.'
    ]);
});


