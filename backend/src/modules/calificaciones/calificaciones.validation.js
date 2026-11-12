// Validaciones del módulo de calificaciones.

import { leerPaginacion } from '../../utils/consulta.js';

// Campos que el cliente puede enviar al calificar un intercambio.
const CAMPOS_CALIFICACION = ['idConexion', 'puntuacion', 'comentario'];

// Valores permitidos por la restricción CHECK de la tabla calificacion.
const PUNTUACION_MINIMA = 1;
const PUNTUACION_MAXIMA = 5;

// Longitud máxima del comentario. La columna es TEXT, así que este límite es
// una decisión de la aplicación.
const MAX_COMENTARIO = 500;

const MENSAJE_ID_INVALIDO =
    'El identificador debe ser un entero positivo válido.';

// Indica si un número es un identificador válido para MySQL.
function esIdValido(id) {
    return Number.isInteger(id) && id > 0 && id <= 4294967295;
}

// Valida un parámetro :id de la URL y guarda el entero en res.locals.
function validarIdParametro(req, res, next, nombre) {
    const valor = req.params.id;
    const id = Number(valor);

    if (
        !/^[1-9]\d*$/.test(valor) ||
        !Number.isSafeInteger(id) ||
        id > 4294967295
    ) {
        return res.status(400).json({
            success: false,
            message: MENSAJE_ID_INVALIDO
        });
    }

    res.locals[nombre] = id;
    next();
}

// Valida el :id de la ruta de calificaciones recibidas por un usuario.
export function validarIdUsuarioCalificado(req, res, next) {
    return validarIdParametro(req, res, next, 'idUsuarioCalificado');
}

// Valida el :id de la ruta de calificaciones de una conexión.
export function validarIdConexionCalificacion(req, res, next) {
    return validarIdParametro(req, res, next, 'idConexionCalificacion');
}

// Valida la puntuación del intercambio.
function validarPuntuacion(valor, errores, datos) {
    const puntuacion = Number(valor);

    if (
        !Number.isInteger(puntuacion) ||
        puntuacion < PUNTUACION_MINIMA ||
        puntuacion > PUNTUACION_MAXIMA
    ) {
        errores.push(
            'El campo puntuacion debe ser un entero entre ' +
                `${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}.`
        );
        return;
    }

    datos.puntuacion = puntuacion;
}

// Valida el comentario opcional.
// Devuelve null cuando se omite o se envía vacío.
function validarComentario(valor, errores) {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (typeof valor !== 'string') {
        errores.push('El campo comentario debe ser texto.');
        return undefined;
    }

    const limpio = valor.trim();

    if (limpio.length === 0) {
        return null;
    }

    if (limpio.length > MAX_COMENTARIO) {
        errores.push(
            'El campo comentario admite como máximo ' +
                `${MAX_COMENTARIO} caracteres.`
        );
        return undefined;
    }

    return limpio;
}

// Valida el cuerpo para calificar un intercambio finalizado.
// El calificado no se recibe del cliente: se deduce de la conexión.
export function validarCrearCalificacion(req, res, next) {
    const { body } = req;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            success: false,
            message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];
    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !CAMPOS_CALIFICACION.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
    }

    const datos = {};
    const idConexion = Number(body.idConexion);

    if (!esIdValido(idConexion)) {
        errores.push(
            'El campo idConexion debe ser un entero positivo válido.'
        );
    } else {
        datos.idConexion = idConexion;
    }

    validarPuntuacion(body.puntuacion, errores, datos);

    if (Object.hasOwn(body, 'comentario')) {
        const comentario = validarComentario(body.comentario, errores);

        if (comentario !== undefined) {
            datos.comentario = comentario;
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los datos enviados.',
            errors: errores
        });
    }

    res.locals.nuevaCalificacion = datos;

    next();
}

// Valida la paginación del listado de calificaciones recibidas.
// Parámetros admitidos: page y limit.
export function validarPaginacionCalificaciones(req, res, next) {
    const { errores, ...paginacion } = leerPaginacion(req.query);

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los filtros enviados.',
            errors: errores
        });
    }

    // Datos listos para el servicio.
    res.locals.busquedaCalificaciones = paginacion;

    next();
}
