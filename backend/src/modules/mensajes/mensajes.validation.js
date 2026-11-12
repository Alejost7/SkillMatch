// Validaciones del módulo de mensajería.

import {
    leerIdFiltro,
    leerPaginacion
} from '../../utils/consulta.js';

// Campos que el cliente puede enviar al escribir un mensaje.
const CAMPOS_MENSAJE = ['idConexion', 'contenido'];

// Campos que el cliente puede enviar al marcar una conversación como leída.
const CAMPOS_LECTURA = ['idConexion'];

// Longitud máxima del contenido. La columna es TEXT, así que este límite es
// una decisión de la aplicación para evitar mensajes desmedidos.
const MAX_CONTENIDO = 1000;

// Indica si un número es un identificador válido para MySQL.
function esIdValido(id) {
    return Number.isInteger(id) && id > 0 && id <= 4294967295;
}

// Revisa que el cuerpo sea un objeto JSON con los campos permitidos.
// Devuelve false cuando el cuerpo no se puede revisar.
function leerCuerpo(body, camposPermitidos, errores) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        errores.push('Debes enviar un objeto JSON.');
        return false;
    }

    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
        return false;
    }

    return true;
}

// Valida el identificador de la conexión enviado en el cuerpo.
function validarIdConexionCuerpo(valor, errores, datos) {
    const id = Number(valor);

    if (!esIdValido(id)) {
        errores.push(
            'El campo idConexion debe ser un entero positivo válido.'
        );
        return;
    }

    datos.idConexion = id;
}

// Valida el contenido del mensaje y lo devuelve recortado.
function validarContenido(valor, errores) {
    if (typeof valor !== 'string') {
        errores.push('El campo contenido debe ser texto.');
        return undefined;
    }

    const limpio = valor.trim();

    if (limpio.length === 0) {
        errores.push('El campo contenido no puede estar vacío.');
        return undefined;
    }

    if (limpio.length > MAX_CONTENIDO) {
        errores.push(
            'El campo contenido admite como máximo ' +
                `${MAX_CONTENIDO} caracteres.`
        );
        return undefined;
    }

    return limpio;
}

// Valida el cuerpo para enviar un mensaje.
export function validarCrearMensaje(req, res, next) {
    const { body } = req;
    const errores = [];

    const cuerpoValido = leerCuerpo(body, CAMPOS_MENSAJE, errores);

    // Con un cuerpo inválido no hay nada más que revisar.
    if (!cuerpoValido) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los datos enviados.',
            errors: errores
        });
    }

    const datos = {};

    validarIdConexionCuerpo(body.idConexion, errores, datos);

    const contenido = validarContenido(body.contenido, errores);

    if (contenido !== undefined) {
        datos.contenido = contenido;
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los datos enviados.',
            errors: errores
        });
    }

    res.locals.nuevoMensaje = datos;

    next();
}

// Valida los filtros y la paginación del listado de mensajes.
// Parámetros admitidos: conexionId, page y limit.
export function validarFiltrosMensajes(req, res, next) {
    const { query } = req;
    const errores = [];

    // Separamos los errores de los datos utilizables.
    const { errores: erroresPaginacion, ...paginacion } = leerPaginacion(query);

    errores.push(...erroresPaginacion);

    const filtros = {
        idConexion: leerIdFiltro(
            query.conexionId,
            'El parámetro conexionId',
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
    res.locals.busquedaMensajes = { filtros, ...paginacion };

    next();
}

// Valida el cuerpo de la ruta que marca los mensajes como leídos.
export function validarMarcarLeidos(req, res, next) {
    const { body } = req;
    const errores = [];

    const cuerpoValido = leerCuerpo(body, CAMPOS_LECTURA, errores);

    const datos = {};

    if (cuerpoValido) {
        validarIdConexionCuerpo(body.idConexion, errores, datos);
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Hay errores en los datos enviados.',
            errors: errores
        });
    }

    res.locals.marcarLeidos = datos;

    next();
}
