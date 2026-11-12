// Pruebas de las utilidades de filtros y paginación.
// No tocan la base de datos: solo verifican la lectura de la query string.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    LIMITE_MAXIMO,
    LIMITE_POR_DEFECTO,
    construirPaginacion,
    leerIdFiltro,
    leerOpcionFiltro,
    leerPaginacion,
    leerTextoFiltro
} from '../../src/utils/consulta.js';

test('leerPaginacion usa los valores por defecto', () => {
    const paginacion = leerPaginacion({});

    assert.deepEqual(paginacion, {
        pagina: 1,
        limite: LIMITE_POR_DEFECTO,
        desplazamiento: 0,
        errores: []
    });
});

test('leerPaginacion convierte page y limit a números', () => {
    const { pagina, limite, desplazamiento, errores } = leerPaginacion({
        page: '3',
        limit: '5'
    });

    assert.equal(pagina, 3);
    assert.equal(limite, 5);
    assert.equal(desplazamiento, 10);
    assert.deepEqual(errores, []);
});

test('leerPaginacion ignora los parámetros vacíos', () => {
    const { pagina, limite, errores } = leerPaginacion({
        page: '',
        limit: ''
    });

    assert.equal(pagina, 1);
    assert.equal(limite, LIMITE_POR_DEFECTO);
    assert.deepEqual(errores, []);
});

test('leerPaginacion rechaza page inválido', () => {
    for (const page of ['0', '-1', 'abc', '1.5', '999999999']) {
        const { errores } = leerPaginacion({ page });

        assert.equal(errores.length, 1, `page=${page} debe ser rechazado`);
        assert.match(errores[0], /page/);
    }
});

test('leerPaginacion rechaza limit fuera de rango', () => {
    for (const limit of ['0', String(LIMITE_MAXIMO + 1), 'abc']) {
        const { errores } = leerPaginacion({ limit });

        assert.equal(errores.length, 1, `limit=${limit} debe ser rechazado`);
        assert.match(errores[0], /limit/);
    }
});

test('leerPaginacion rechaza parámetros repetidos', () => {
    const { errores } = leerPaginacion({ page: ['1', '2'] });

    assert.equal(errores.length, 1);
    assert.match(errores[0], /page/);
});

test('construirPaginacion calcula la última página', () => {
    assert.deepEqual(
        construirPaginacion({ total: 25, pagina: 3, limite: 10 }),
        {
            pagina: 3,
            limite: 10,
            total: 25,
            totalPaginas: 3,
            tieneAnterior: true,
            tieneSiguiente: false
        }
    );
});

test('construirPaginacion devuelve cero páginas sin resultados', () => {
    assert.deepEqual(
        construirPaginacion({ total: 0, pagina: 1, limite: 10 }),
        {
            pagina: 1,
            limite: 10,
            total: 0,
            totalPaginas: 0,
            tieneAnterior: false,
            tieneSiguiente: false
        }
    );
});

test('leerIdFiltro devuelve el identificador validado', () => {
    const errores = [];

    assert.equal(leerIdFiltro('7', 'El parámetro categoriaId', errores), 7);
    assert.equal(
        leerIdFiltro(undefined, 'El parámetro categoriaId', errores),
        undefined
    );
    assert.deepEqual(errores, []);
});

test('leerIdFiltro rechaza identificadores inválidos', () => {
    for (const valor of ['abc', '0', '1.5', '-3']) {
        const errores = [];
        const resultado = leerIdFiltro(
            valor,
            'El parámetro categoriaId',
            errores
        );

        assert.equal(resultado, undefined, `${valor} debe ser rechazado`);
        assert.equal(errores.length, 1);
        assert.match(errores[0], /categoriaId/);
    }
});

test('leerIdFiltro ignora un parámetro vacío', () => {
    const errores = [];

    const resultado = leerIdFiltro('', 'El parámetro categoriaId', errores);

    assert.equal(resultado, undefined);
    assert.deepEqual(errores, []);
});

test('leerTextoFiltro recorta espacios y descarta textos vacíos', () => {
    const errores = [];

    const recortado = leerTextoFiltro(
        '  Java  ',
        100,
        'El parámetro nombre',
        errores
    );
    const vacio = leerTextoFiltro('   ', 100, 'El parámetro nombre', errores);
    const ausente = leerTextoFiltro(
        undefined,
        100,
        'El parámetro nombre',
        errores
    );

    assert.equal(recortado, 'Java');
    assert.equal(vacio, undefined);
    assert.equal(ausente, undefined);
    assert.deepEqual(errores, []);
});

test('leerTextoFiltro rechaza textos largos o no textuales', () => {
    const errores = [];

    const largo = leerTextoFiltro(
        'x'.repeat(101),
        100,
        'El parámetro nombre',
        errores
    );
    const noTexto = leerTextoFiltro(12, 100, 'El parámetro nombre', errores);

    assert.equal(largo, undefined);
    assert.equal(noTexto, undefined);
    assert.equal(errores.length, 2);
    assert.match(errores[0], /máximo 100 caracteres/);
    assert.match(errores[1], /debe ser texto/);
});

test('leerOpcionFiltro normaliza y valida la lista cerrada', () => {
    const errores = [];
    const ESTADOS = ['activo', 'inactivo'];

    const normalizado = leerOpcionFiltro(
        ' ACTIVO ',
        ESTADOS,
        'El parámetro estado',
        errores
    );
    const invalido = leerOpcionFiltro(
        'borrado',
        ESTADOS,
        'El parámetro estado',
        errores
    );

    assert.equal(normalizado, 'activo');
    assert.equal(invalido, undefined);
    assert.equal(errores.length, 1);
    assert.match(errores[0], /activo o inactivo/);
});
