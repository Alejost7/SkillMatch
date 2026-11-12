// Utilidades compartidas para leer, validar y paginar los listados.
// Los parámetros de la query string llegan siempre como texto, así que aquí se
// normalizan antes de usarlos en las consultas SQL.

export const LIMITE_POR_DEFECTO = 10;
export const LIMITE_MAXIMO = 50;

// Límite superior de page para evitar desplazamientos enormes.
const PAGINA_MAXIMA = 100000;

// Convierte el valor de un parámetro a número entero sin signo.
// Devuelve null cuando el valor no tiene ese formato.
function leerEntero(valor) {
    // Los parámetros repetidos (?page=1&page=2) llegan como arreglo.
    if (Array.isArray(valor) || valor === null || valor === undefined) {
        return null;
    }

    const texto = String(valor);

    return /^\d+$/.test(texto) ? Number(texto) : null;
}

// Lee page y limit aplicando los valores por defecto.
// Los parámetros vacíos se ignoran para tolerar enlaces con ?page=&limit=.
export function leerPaginacion(query = {}) {
    const errores = [];

    let pagina = 1;
    let limite = LIMITE_POR_DEFECTO;

    if (query.page !== undefined && query.page !== '') {
        const page = leerEntero(query.page);

        if (page === null || page < 1 || page > PAGINA_MAXIMA) {
            errores.push(
                `El parámetro page debe ser un entero entre 1 y ${PAGINA_MAXIMA}.`
            );
        } else {
            pagina = page;
        }
    }

    if (query.limit !== undefined && query.limit !== '') {
        const limit = leerEntero(query.limit);

        if (limit === null || limit < 1 || limit > LIMITE_MAXIMO) {
            errores.push(
                `El parámetro limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}.`
            );
        } else {
            limite = limit;
        }
    }

    return {
        pagina,
        limite,
        // Desplazamiento listo para la cláusula OFFSET.
        desplazamiento: (pagina - 1) * limite,
        errores
    };
}

// Construye los metadatos que acompañan a un listado paginado.
export function construirPaginacion({ total, pagina, limite }) {
    const totalPaginas = Math.ceil(total / limite);

    return {
        pagina,
        limite,
        total,
        totalPaginas,
        tieneAnterior: pagina > 1,
        tieneSiguiente: pagina < totalPaginas
    };
}

// Lee un identificador opcional enviado por la URL.
// Devuelve undefined cuando no se envió y registra el error cuando el valor
// no es un entero positivo válido para MySQL.
export function leerIdFiltro(valor, etiqueta, errores) {
    if (valor === undefined || valor === '') {
        return undefined;
    }

    const id = leerEntero(valor);

    if (id === null || id < 1 || id > 4294967295) {
        errores.push(`${etiqueta} debe ser un entero positivo válido.`);
        return undefined;
    }

    return id;
}

// Lee un filtro de texto opcional usado en búsquedas parciales.
// Devuelve undefined cuando no se envió o quedó vacío tras recortar espacios.
export function leerTextoFiltro(valor, maximo, etiqueta, errores) {
    if (valor === undefined || valor === '') {
        return undefined;
    }

    if (typeof valor !== 'string') {
        errores.push(`${etiqueta} debe ser texto.`);
        return undefined;
    }

    const limpio = valor.trim();

    if (limpio.length === 0) {
        return undefined;
    }

    if (limpio.length > maximo) {
        errores.push(`${etiqueta} debe tener máximo ${maximo} caracteres.`);
        return undefined;
    }

    return limpio;
}

// Lee un filtro opcional que debe pertenecer a una lista cerrada.
export function leerOpcionFiltro(valor, opciones, etiqueta, errores) {
    if (valor === undefined || valor === '') {
        return undefined;
    }

    if (typeof valor !== 'string') {
        errores.push(`${etiqueta} debe ser texto.`);
        return undefined;
    }

    const limpio = valor.trim().toLowerCase();

    if (!opciones.includes(limpio)) {
        errores.push(`${etiqueta} debe ser ${opciones.join(' o ')}.`);
        return undefined;
    }

    return limpio;
}