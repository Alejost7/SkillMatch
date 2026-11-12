// Validaciones del módulo de conexiones.

import { leerOpcionFiltro, leerPaginacion } from '../../utils/consulta.js';

// Valores permitidos por la restricción CHECK de la tabla conexion.
export const ESTADOS_CONEXION = ['activa', 'finalizada', 'bloqueada'];

const MENSAJE_ID_INVALIDO =
    'El identificador debe ser un entero positivo válido.';

// Valida el parámetro :id de la URL y guarda el entero en res.locals.
export function validarIdConexion(req, res, next) {
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

    res.locals.idConexion = id;
    next();
}

// Valida los filtros y la paginación del listado de conexiones.
// Parámetros admitidos: estado, page y limit.
export function validarFiltrosConexiones(req, res, next) {
    const { query } = req;
    const errores = [];

    // Separamos los errores de los datos utilizables.
    const { errores: erroresPaginacion, ...paginacion } = leerPaginacion(query);

    errores.push(...erroresPaginacion);

    const filtros = {
        estado: leerOpcionFiltro(
            query.estado,
            ESTADOS_CONEXION,
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
    res.locals.busquedaConexiones = { filtros, ...paginacion };

    next();
}
