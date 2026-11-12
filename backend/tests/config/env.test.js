// Pruebas de la validación de configuración del backend.
// No dependen del archivo .env real: se le pasan objetos controlados.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    cargarConfig,
    env,
    LONGITUD_MINIMA_SECRETO
} from '../../src/config/env.js';

const CONFIGURACION_VALIDA = Object.freeze({
    PORT: '4000',
    DB_HOST: '127.0.0.1',
    DB_PORT: '3307',
    DB_NAME: 'skillmatch_pruebas',
    DB_USER: 'usuario_pruebas',
    DB_PASSWORD: 'contrasena-de-pruebas',
    JWT_SECRET: 'secreto-de-pruebas-con-longitud-suficiente',
    JWT_EXPIRES_IN: '2h'
});

const SECRETO_DE_EJEMPLO = 'cambia_esta_clave_en_produccion';

const VARIABLES_OBLIGATORIAS = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
];

function configurar(cambios = {}) {
    return { ...CONFIGURACION_VALIDA, ...cambios };
}

// Devuelve el mensaje del error de configuración esperado.
function capturarMensaje(origen) {
    try {
        cargarConfig(origen);
    } catch (error) {
        return error.message;
    }

    assert.fail('Se esperaba un error de configuración y no ocurrió.');
}

function mensajeDeError(cambios = {}) {
    return capturarMensaje(configurar(cambios));
}

test('devuelve la configuración tipada con valores válidos', () => {
    const config = cargarConfig(configurar());

    assert.equal(config.port, 4000);
    assert.equal(config.database.host, '127.0.0.1');
    assert.equal(config.database.port, 3307);
    assert.equal(config.database.name, 'skillmatch_pruebas');
    assert.equal(config.database.user, 'usuario_pruebas');
    assert.equal(config.database.password, 'contrasena-de-pruebas');
    assert.equal(
        config.jwt.secret,
        'secreto-de-pruebas-con-longitud-suficiente'
    );
    assert.equal(config.jwt.expiresIn, '2h');
    assert.deepEqual(config.advertencias, []);
});

test('usa valores por defecto cuando faltan las variables opcionales', () => {
    const origen = configurar();

    delete origen.PORT;
    delete origen.DB_PORT;
    delete origen.JWT_EXPIRES_IN;

    const config = cargarConfig(origen);

    assert.equal(config.port, 3000);
    assert.equal(config.database.port, 3306);
    assert.equal(config.jwt.expiresIn, '1h');
});

test('recorta los espacios alrededor de los valores', () => {
    const config = cargarConfig(
        configurar({
            DB_HOST: '  127.0.0.1  ',
            DB_NAME: ' skillmatch ',
            JWT_EXPIRES_IN: ' 30m '
        })
    );

    assert.equal(config.database.host, '127.0.0.1');
    assert.equal(config.database.name, 'skillmatch');
    assert.equal(config.jwt.expiresIn, '30m');
});

test('rechaza cada variable obligatoria cuando falta', () => {
    for (const variable of VARIABLES_OBLIGATORIAS) {
        const origen = configurar();

        delete origen[variable];

        const mensaje = capturarMensaje(origen);

        assert.match(
            mensaje,
            new RegExp(`Falta configurar la variable de entorno: ${variable}`),
            `Se esperaba un error para ${variable}`
        );
    }
});

test('rechaza variables obligatorias vacías o con solo espacios', () => {
    const mensaje = mensajeDeError({ DB_USER: '   ', JWT_SECRET: '   ' });

    assert.match(mensaje, /Falta configurar la variable de entorno: DB_USER/);
    assert.match(mensaje, /Falta configurar la variable de entorno: JWT_SECRET/);
});

test('exige un JWT_SECRET de al menos 16 caracteres', () => {
    assert.equal(LONGITUD_MINIMA_SECRETO, 16);

    const mensaje = mensajeDeError({ JWT_SECRET: 'demasiado-corto' });

    assert.match(mensaje, /JWT_SECRET debe tener al menos 16 caracteres/);
});

test('acepta un JWT_SECRET con la longitud mínima exacta', () => {
    const secreto = 'a'.repeat(LONGITUD_MINIMA_SECRETO);
    const config = cargarConfig(configurar({ JWT_SECRET: secreto }));

    assert.equal(config.jwt.secret, secreto);
});

test('rechaza puertos inválidos', () => {
    for (const puerto of ['abc', '0', '-1', '70000', '3000.5', '']) {
        const mensaje = mensajeDeError({ PORT: puerto });

        assert.match(
            mensaje,
            /La variable PORT debe ser un puerto válido/,
            `Se esperaba un error para PORT=${puerto}`
        );
    }
});

test('rechaza un DB_PORT inválido', () => {
    const mensaje = mensajeDeError({ DB_PORT: 'no-es-un-puerto' });

    assert.match(mensaje, /La variable DB_PORT debe ser un puerto válido/);
});

test('rechaza un JWT_EXPIRES_IN con formato desconocido', () => {
    for (const valor of ['una hora', '1 hora', '-1h', '1H', 'h']) {
        const mensaje = mensajeDeError({ JWT_EXPIRES_IN: valor });

        assert.match(
            mensaje,
            /JWT_EXPIRES_IN debe usar el formato de jsonwebtoken/,
            `Se esperaba un error para JWT_EXPIRES_IN=${valor}`
        );
    }
});

test('acepta los formatos válidos de JWT_EXPIRES_IN', () => {
    for (const valor of ['45s', '30m', '1h', '7d', '120']) {
        const config = cargarConfig(configurar({ JWT_EXPIRES_IN: valor }));

        assert.equal(config.jwt.expiresIn, valor);
    }
});

test('advierte cuando se usa el secreto de ejemplo', () => {
    const config = cargarConfig(configurar({ JWT_SECRET: SECRETO_DE_EJEMPLO }));

    assert.equal(config.advertencias.length, 1);
    assert.match(config.advertencias[0], /valor de ejemplo/);
});

test('no genera advertencias con un secreto propio', () => {
    const config = cargarConfig(configurar());

    assert.deepEqual(config.advertencias, []);
});

test('nunca incluye valores sensibles en el mensaje de error', () => {
    const mensaje = mensajeDeError({ JWT_SECRET: 'secreto-corto' });

    assert.ok(!mensaje.includes('secreto-corto'));
    assert.ok(!mensaje.includes(CONFIGURACION_VALIDA.DB_PASSWORD));
});

test('el módulo exporta una configuración válida al importarse', () => {
    assert.equal(typeof env.port, 'number');
    assert.ok(env.jwt.secret.length >= LONGITUD_MINIMA_SECRETO);
    assert.equal(typeof env.jwt.expiresIn, 'string');
    assert.ok(Array.isArray(env.advertencias));
});


test('agrupa todos los errores en un único mensaje', () => {
    const mensaje = mensajeDeError({
        DB_NAME: '',
        DB_USER: '',
        JWT_SECRET: ''
    });

    assert.match(mensaje, /Configuración de entorno inválida/);
    assert.match(mensaje, /DB_NAME/);
    assert.match(mensaje, /DB_USER/);
    assert.match(mensaje, /JWT_SECRET/);
});
