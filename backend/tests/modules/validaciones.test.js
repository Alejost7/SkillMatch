// Pruebas de las validaciones de entrada de los módulos.
// No tocan la base de datos: solo verifican cómo se normalizan y rechazan datos.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarLogin,
    validarRegistro
} from '../../src/modules/auth/auth.validation.js';
import {
    validarActualizarPerfil,
    validarIdUsuario
} from '../../src/modules/usuarios/usuarios.validation.js';
import {
    validarActualizarCategoria,
    validarCrearCategoria,
    validarIdCategoria
} from '../../src/modules/categorias/categorias.validation.js';
import {
    validarActualizarHabilidad,
    validarCrearHabilidad,
    validarFiltroCategoria,
    validarIdHabilidad
} from '../../src/modules/habilidades/habilidades.validation.js';
import { crearReq, crearRes, ejecutarMiddleware } from '../helpers/fakes.js';

const REGISTRO_VALIDO = Object.freeze({
    nombres: '  Ana María  ',
    apellidos: ' Gómez ',
    correoElectronico: '  Ana.Gomez@Example.COM ',
    contrasena: 'contrasena-segura',
    alias: '  ana  '
});

test('validarRegistro normaliza y guarda los datos limpios', () => {
    const req = crearReq({ body: { ...REGISTRO_VALIDO } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarRegistro, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.usuario, {
        nombres: 'Ana María',
        apellidos: 'Gómez',
        correoElectronico: 'ana.gomez@example.com',
        contrasena: 'contrasena-segura',
        alias: 'ana'
    });
});

test('validarRegistro convierte un alias vacío en null', () => {
    const req = crearReq({ body: { ...REGISTRO_VALIDO, alias: '   ' } });
    const res = crearRes();

    ejecutarMiddleware(validarRegistro, req, res);

    assert.equal(res.locals.usuario.alias, null);
});

test('validarRegistro acepta que el alias no se envíe', () => {
    const { alias, ...sinAlias } = REGISTRO_VALIDO;
    const req = crearReq({ body: sinAlias });
    const res = crearRes();

    ejecutarMiddleware(validarRegistro, req, res);

    assert.equal(res.locals.usuario.alias, null);
});

test('validarRegistro rechaza un cuerpo que no es objeto', () => {
    for (const body of [undefined, null, [], 'texto', 42]) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarRegistro,
            crearReq({ body }),
            res
        );

        assert.equal(continuo, false);
        assert.equal(res.statusCode, 400);
        assert.equal(
            res.body.message,
            'Por favor, debes enviar un objeto JSON.'
        );
    }
});

test('validarRegistro detecta campos no permitidos', () => {
    const req = crearReq({
        body: { ...REGISTRO_VALIDO, idRol: 2, esAdmin: true }
    });
    const res = crearRes();

    ejecutarMiddleware(validarRegistro, req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 1);
    assert.match(res.body.errors[0], /Campos no permitidos: idRol, esAdmin/);
});

test('validarRegistro acumula todos los errores de formato', () => {
    const req = crearReq({
        body: {
            nombres: '',
            apellidos: '',
            correoElectronico: 'no-es-un-correo',
            contrasena: 'corta',
            alias: 'a'.repeat(51)
        }
    });
    const res = crearRes();

    ejecutarMiddleware(validarRegistro, req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Hay errores en los datos enviados.');
    assert.equal(res.body.errors.length, 5);
});

test('validarLogin exige correo y contraseña', () => {
    const req = crearReq({ body: {} });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarLogin, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, [
        'El correo electrónico es obligatorio.',
        'La contraseña es obligatoria.'
    ]);
});

test('validarLogin normaliza el correo y guarda las credenciales', () => {
    const req = crearReq({
        body: {
            correoElectronico: '  ANA@Example.com ',
            contrasena: 'secreta'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarLogin, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.credenciales, {
        correoElectronico: 'ana@example.com',
        contrasena: 'secreta'
    });
});

test('validarIdUsuario acepta enteros positivos', () => {
    const req = crearReq({ params: { id: '15' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarIdUsuario, req, res);

    assert.equal(continuo, true);
    assert.equal(res.locals.idUsuario, 15);
});

test('validarIdUsuario rechaza identificadores inválidos', () => {
    for (const id of ['0', 'abc', '-1', '1.5', '01', '4294967296', '']) {
        const res = crearRes();

        const continuo = ejecutarMiddleware(
            validarIdUsuario,
            crearReq({ params: { id } }),
            res
        );

        assert.equal(continuo, false, `Se aceptó el id "${id}"`);
        assert.equal(res.statusCode, 400);
        assert.equal(
            res.body.message,
            'El identificador debe ser un entero positivo válido.'
        );
    }
});

test('validarIdCategoria guarda el id validado', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdCategoria,
        crearReq({ params: { id: '3' } }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idCategoria, 3);
});

test('validarIdCategoria rechaza identificadores inválidos', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarIdCategoria,
        crearReq({ params: { id: 'x' } }),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
});

test('validarIdHabilidad guarda el id validado', () => {
    const req = crearReq({ params: { id: '8' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarIdHabilidad, req, res);

    assert.equal(continuo, true);
    assert.equal(res.locals.idHabilidad, 8);
});

test('validarActualizarPerfil exige nombres y apellidos', () => {
    const req = crearReq({ body: { alias: 'ana' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 2);
});

test('validarActualizarPerfil normaliza los campos extendidos del perfil', () => {
    const req = crearReq({
        body: {
            nombres: ' Ana ',
            apellidos: 'Gómez',
            alias: 'ana',
            biografia: '  Estudiante de ingeniería  ',
            fotoPerfilUrl: ' https://ejemplo.com/foto.png ',
            disponibilidad: ' Tardes ',
            ciudad: ' Bogotá ',
            pais: ' Colombia '
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.datosUsuario, {
        nombres: 'Ana',
        apellidos: 'Gómez',
        alias: 'ana'
    });
    assert.deepEqual(res.locals.datosPerfil, {
        biografia: 'Estudiante de ingeniería',
        fotoPerfilUrl: 'https://ejemplo.com/foto.png',
        disponibilidad: 'Tardes',
        ciudad: 'Bogotá',
        pais: 'Colombia'
    });
});

test('validarActualizarPerfil no incluye campos de perfil que no se enviaron', () => {
    const req = crearReq({
        body: { nombres: 'Ana', apellidos: 'Gómez' }
    });
    const res = crearRes();

    ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.deepEqual(res.locals.datosPerfil, {});
});

test('validarActualizarPerfil permite limpiar campos del perfil', () => {
    const req = crearReq({
        body: {
            nombres: 'Ana',
            apellidos: 'Gómez',
            biografia: '   ',
            fotoPerfilUrl: null,
            ciudad: null
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.datosPerfil, {
        biografia: null,
        fotoPerfilUrl: null,
        ciudad: null
    });
});

test('validarActualizarPerfil rechaza campos de perfil inválidos', () => {
    const req = crearReq({
        body: {
            nombres: 'Ana',
            apellidos: 'Gómez',
            biografia: 'x'.repeat(1001),
            fotoPerfilUrl: 'no-es-una-url',
            disponibilidad: 42,
            ciudad: 'a'.repeat(81),
            pais: 'a'.repeat(81)
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 5);
    assert.ok(
        res.body.errors.some((error) => /biografía.*1000 caracteres/.test(error))
    );
    assert.ok(
        res.body.errors.some((error) => /URL que inicie con http/.test(error))
    );
    assert.ok(
        res.body.errors.some((error) => /disponibilidad debe ser texto/i.test(error))
    );
});

test('validarActualizarPerfil rechaza campos no permitidos', () => {
    const req = crearReq({
        body: {
            nombres: 'Ana',
            apellidos: 'Gómez',
            idRol: 2,
            estadoCuenta: 'activo'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarPerfil, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.match(
        res.body.errors[0],
        /Campos no permitidos: idRol, estadoCuenta/
    );
});

test('validarFiltroCategoria deja el filtro vacío si no se envía', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarFiltroCategoria,
        crearReq({ query: {} }),
        res
    );

    assert.equal(continuo, true);
    assert.equal(res.locals.idCategoria, null);
});

test('validarFiltroCategoria convierte el parámetro a número', () => {
    const res = crearRes();

    ejecutarMiddleware(
        validarFiltroCategoria,
        crearReq({ query: { categoriaId: '4' } }),
        res
    );

    assert.equal(res.locals.idCategoria, 4);
});

test('validarFiltroCategoria rechaza un parámetro inválido', () => {
    const res = crearRes();

    const continuo = ejecutarMiddleware(
        validarFiltroCategoria,
        crearReq({ query: { categoriaId: 'x' } }),
        res
    );

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /categoriaId/);
});

test('validarCrearHabilidad aplica los valores por defecto', () => {
    const req = crearReq({
        body: { idCategoria: '2', nombre: '  Guitarra  ' }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearHabilidad, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.habilidad, {
        idCategoria: 2,
        nombre: 'Guitarra',
        descripcion: null,
        estado: 'activo'
    });
});

test('validarCrearHabilidad acepta una descripción opcional', () => {
    const req = crearReq({
        body: {
            idCategoria: 2,
            nombre: 'Guitarra',
            descripcion: '  Clases básicas  ',
            estado: 'inactivo'
        }
    });
    const res = crearRes();

    ejecutarMiddleware(validarCrearHabilidad, req, res);

    assert.equal(res.locals.habilidad.descripcion, 'Clases básicas');
    assert.equal(res.locals.habilidad.estado, 'inactivo');
});

test('validarCrearHabilidad rechaza datos inválidos', () => {
    const req = crearReq({
        body: {
            idCategoria: 0,
            nombre: '   ',
            descripcion: 42,
            estado: 'borrador'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearHabilidad, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 4);
});

test('validarActualizarHabilidad exige todos los campos', () => {
    const req = crearReq({ body: { nombre: 'Guitarra' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarHabilidad, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(
        res.body.errors.some((error) => /idCategoria es obligatorio/.test(error))
    );
    assert.ok(
        res.body.errors.some((error) => /estado es obligatorio/.test(error))
    );
});

test('validarActualizarHabilidad acepta un cuerpo completo', () => {
    const req = crearReq({
        body: {
            idCategoria: 1,
            nombre: 'Node.js',
            descripcion: null,
            estado: 'activo'
        }
    });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarHabilidad, req, res);

    assert.equal(continuo, true);
    assert.equal(res.locals.habilidad.nombre, 'Node.js');
});

test('validarCrearCategoria aplica los valores por defecto', () => {
    const req = crearReq({ body: { nombre: '  Música ' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearCategoria, req, res);

    assert.equal(continuo, true);
    assert.deepEqual(res.locals.categoria, {
        nombre: 'Música',
        descripcion: null,
        estado: 'activo'
    });
});

test('validarCrearCategoria rechaza un nombre demasiado largo', () => {
    const req = crearReq({ body: { nombre: 'a'.repeat(81) } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarCrearCategoria, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.errors[0], /entre 1 y 80 caracteres/);
});

test('validarActualizarCategoria exige todos los campos', () => {
    const req = crearReq({ body: { nombre: 'Música' } });
    const res = crearRes();

    const continuo = ejecutarMiddleware(validarActualizarCategoria, req, res);

    assert.equal(continuo, false);
    assert.equal(res.statusCode, 400);
    assert.ok(
        res.body.errors.some((error) => /descripcion es obligatorio/.test(error))
    );
    assert.ok(
        res.body.errors.some((error) => /estado es obligatorio/.test(error))
    );
});


