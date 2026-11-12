// Validaciones del módulo de solicitudes de conexión.

import { leerOpcionFiltro, leerPaginacion } from '../../utils/consulta.js';

// Valores permitidos por la restricción CHECK de solicitud_conexion.
export const ESTADOS_SOLICITUD = [
    'pendiente',
    'aceptada',
    'rechazada',
    'cancelada'
];

// Campos que el cliente puede enviar al crear una solicitud.
const CAMPOS_SOLICITUD = ['idUsuarioReceptor', 'mensajeInicial'];

// Longitud máxima del mensaje inicial. La columna es TEXT, así que este
// límite es una decisión de la aplicación.
const MAX_MENSAJE_INICIAL = 500;

const MENSAJE_ID_INVALIDO =
    'El identificador debe ser un entero positivo válido.';

// Indica si un número es un identificador válido para MySQL.
function esIdValido(id) {
    return Number.isInteger(id) && id > 0 && id <= 4294967295;
}

// Valida el parámetro :id de la URL y guarda el entero en res.locals.
export function validarIdSolicitud(req, res, next) {
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

    res.locals.idSolicitud = id;
    next();
}

// Valida los filtros y la paginación de los listados de solicitudes.
// Parámetros admitidos: estado, page y limit.
export function validarFiltrosSolicitudes(req, res, next) {
    const { query } = req;
    const errores = [];

    // Separamos los errores de los datos utilizables.
    const { errores: erroresPaginacion, ...paginacion } = leerPaginacion(query);

    errores.push(...erroresPaginacion);

    const filtros = {
        estado: leerOpcionFiltro(
            query.estado,
            ESTADOS_SOLICITUD,
            'El parámetro estado',
            errores
        )
    };

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los filtros enviados.',
            errors: errores
        });
    }

    // Datos listos para el servicio.
    res.locals.busquedaSolicitudes = { filtros, ...paginacion };

    next();
}

// Valida el mensaje inicial de una solicitud.
// Devuelve null cuando el campo se limpia a propósito, el texto limpio cuando
// es válido y undefined cuando hubo un error.
function validarMensajeInicial(valor, errores) {
    if (valor === null) {
        return null;
    }

    if (typeof valor !== 'string') {
        errores.push('El mensaje inicial debe ser texto.');
        return undefined;
    }

    const limpio = valor.trim();

    if (limpio.length === 0) {
        return null;
    }

    if (limpio.length > MAX_MENSAJE_INICIAL) {
        errores.push(
            'El mensaje inicial admite como máximo ' +
                `${MAX_MENSAJE_INICIAL} caracteres.`
        );
        return undefined;
    }

    return limpio;
}

// Valida el cuerpo para enviar una solicitud de conexión.
export function validarCrearSolicitud(req, res, next) {
    const { body } = req;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            success: false,
            message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];
    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !CAMPOS_SOLICITUD.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
    }

    const datos = {};
    const idReceptor = Number(body.idUsuarioReceptor);

    if (!esIdValido(idReceptor)) {
        errores.push(
            'El campo idUsuarioReceptor debe ser un entero positivo válido.'
        );
    } else if (idReceptor === req.usuario?.idUsuario) {
        // Una solicitud siempre va dirigida a otra persona.
        errores.push('No puedes enviarte una solicitud a ti mismo.');
    } else {
        datos.idUsuarioReceptor = idReceptor;
    }

    if (Object.hasOwn(body, 'mensajeInicial')) {
        const mensaje = validarMensajeInicial(body.mensajeInicial, errores);

        if (mensaje !== undefined) {
            datos.mensajeInicial = mensaje;
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los datos enviados.',
            errors: errores
        });
    }

    res.locals.nuevaSolicitud = datos;

    next();
}
