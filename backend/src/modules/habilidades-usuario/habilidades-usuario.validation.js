// Validaciones del módulo de habilidades del usuario.

// Valores permitidos por las restricciones CHECK de database/shema.sql.
const NIVELES = ['basico', 'intermedio', 'avanzado'];
const ESTADOS = ['activo', 'inactivo'];

// Campos que el cliente puede enviar en cada recurso.
const CAMPOS_OFRECIDA = ['idHabilidad', 'nivel', 'descripcionApoyo', 'estado'];
const CAMPOS_REQUERIDA = [
    'idHabilidad',
    'nivelDeseado',
    'objetivoAprendizaje',
    'estado'
];

// Longitud máxima de los textos libres. Las columnas son TEXT, así que este
// límite es una decisión de la aplicación para evitar cargas innecesarias.
const MAX_DESCRIPCION_APOYO = 500;
const MAX_OBJETIVO_APRENDIZAJE = 500;

const MENSAJE_ID_INVALIDO =
    'El identificador debe ser un entero positivo válido.';

// Indica si un número es un identificador válido para MySQL.
function esIdValido(id) {
    return Number.isInteger(id) && id > 0 && id <= 4294967295;
}

// Crea un validador del parámetro :id que guarda el entero en res.locals.
function crearValidadorId(clave) {
    return function validarId(req, res, next) {
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

        // Guardamos el id validado para usarlo en el controlador.
        res.locals[clave] = id;
        next();
    };
}

// Identificador del registro en usuario_habilidad_ofrecida.
export const validarIdOfrecida = crearValidadorId('idHabilidadOfrecida');

// Identificador del registro en usuario_habilidad_requerida.
export const validarIdRequerida = crearValidadorId('idHabilidadRequerida');

// Verifica que el cuerpo sea un objeto JSON y detecta campos desconocidos.
// Devuelve null cuando ya se respondió con un error.
function prepararValidacion(req, res, camposPermitidos) {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({
            success: false,
            message: 'Debes enviar un objeto JSON.'
        });

        return null;
    }

    const errores = [];
    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
    }

    return { body, errores };
}

// Normaliza un texto corto en minúsculas para compararlo con los valores
// permitidos (nivel y estado).
function normalizarOpcion(valor) {
    return typeof valor === 'string' ? valor.trim().toLowerCase() : '';
}

// Valida un texto libre. Devuelve:
//   null      -> el campo se limpia a propósito,
//   string    -> valor limpio,
//   undefined -> hubo un error y el campo no debe guardarse.
function validarTexto(valor, maximo, etiqueta, errores) {
    if (valor === null) {
        return null;
    }

    if (typeof valor !== 'string') {
        errores.push(`${etiqueta} debe ser texto.`);
        return undefined;
    }

    const limpio = valor.trim();

    if (limpio.length === 0) {
        return null;
    }

    if (limpio.length > maximo) {
        errores.push(`${etiqueta} debe tener máximo ${maximo} caracteres.`);
        return undefined;
    }

    return limpio;
}

// Valida el campo idHabilidad. Es obligatorio al crear y opcional al actualizar.
function validarIdHabilidad(body, datos, errores, obligatorio) {
    if (!obligatorio && !Object.hasOwn(body, 'idHabilidad')) {
        return;
    }

    const id = Number(body.idHabilidad);

    if (!esIdValido(id)) {
        errores.push(
            'El campo idHabilidad debe ser un entero positivo válido.'
        );
        return;
    }

    datos.idHabilidad = id;
}

// Valida el nivel de una habilidad ofrecida.
// Es obligatorio al crear; al actualizar solo se valida si se envía.
function validarNivel(body, datos, errores, esActualizacion) {
    if (esActualizacion && !Object.hasOwn(body, 'nivel')) {
        return;
    }

    const nivel = normalizarOpcion(body.nivel);

    if (!NIVELES.includes(nivel)) {
        errores.push('El nivel debe ser basico, intermedio o avanzado.');
        return;
    }

    datos.nivel = nivel;
}

// Valida el nivel deseado de una habilidad requerida.
// Siempre es opcional y enviar null o vacío lo limpia.
function validarNivelDeseado(body, datos, errores) {
    if (!Object.hasOwn(body, 'nivelDeseado')) {
        return;
    }

    const valor = body.nivelDeseado;

    if (valor === null) {
        datos.nivelDeseado = null;
        return;
    }

    if (typeof valor !== 'string') {
        errores.push('El nivel deseado debe ser texto.');
        return;
    }

    const nivel = normalizarOpcion(valor);

    if (nivel.length === 0) {
        datos.nivelDeseado = null;
        return;
    }

    if (!NIVELES.includes(nivel)) {
        errores.push(
            'El nivel deseado debe ser basico, intermedio o avanzado.'
        );
        return;
    }

    datos.nivelDeseado = nivel;
}

// Valida el estado. Al crear, por defecto es activo.
function validarEstado(body, datos, errores, esActualizacion) {
    if (!Object.hasOwn(body, 'estado')) {
        if (!esActualizacion) {
            datos.estado = 'activo';
        }

        return;
    }

    const estado = normalizarOpcion(body.estado);

    if (!ESTADOS.includes(estado)) {
        errores.push('El estado debe ser activo o inactivo.');
        return;
    }

    datos.estado = estado;
}

// Responde con 400 si hay errores acumulados.
function responderErrores(res, errores) {
    if (errores.length === 0) {
        return false;
    }

    res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
    });

    return true;
}

// Valida los datos de una habilidad ofrecida.
function validarDatosOfrecida(req, res, next, esActualizacion) {
    const preparado = prepararValidacion(req, res, CAMPOS_OFRECIDA);

    if (!preparado) {
        return;
    }

    const { body, errores } = preparado;
    const datos = {};

    validarIdHabilidad(body, datos, errores, !esActualizacion);
    validarNivel(body, datos, errores, esActualizacion);

    if (Object.hasOwn(body, 'descripcionApoyo')) {
        const descripcion = validarTexto(
            body.descripcionApoyo,
            MAX_DESCRIPCION_APOYO,
            'La descripción de apoyo',
            errores
        );

        if (descripcion !== undefined) {
            datos.descripcionApoyo = descripcion;
        }
    }

    validarEstado(body, datos, errores, esActualizacion);

    // En una actualización parcial el cliente debe indicar qué cambiar.
    if (
        esActualizacion &&
        errores.length === 0 &&
        Object.keys(datos).length === 0
    ) {
        errores.push('Debes enviar al menos un campo para actualizar.');
    }

    if (responderErrores(res, errores)) {
        return;
    }

    // Datos limpios para el servicio.
    res.locals.ofrecida = datos;

    next();
}

// Valida los datos de una habilidad requerida.
function validarDatosRequerida(req, res, next, esActualizacion) {
    const preparado = prepararValidacion(req, res, CAMPOS_REQUERIDA);

    if (!preparado) {
        return;
    }

    const { body, errores } = preparado;
    const datos = {};

    validarIdHabilidad(body, datos, errores, !esActualizacion);
    validarNivelDeseado(body, datos, errores);

    if (Object.hasOwn(body, 'objetivoAprendizaje')) {
        const objetivo = validarTexto(
            body.objetivoAprendizaje,
            MAX_OBJETIVO_APRENDIZAJE,
            'El objetivo de aprendizaje',
            errores
        );

        if (objetivo !== undefined) {
            datos.objetivoAprendizaje = objetivo;
        }
    }

    validarEstado(body, datos, errores, esActualizacion);

    if (
        esActualizacion &&
        errores.length === 0 &&
        Object.keys(datos).length === 0
    ) {
        errores.push('Debes enviar al menos un campo para actualizar.');
    }

    if (responderErrores(res, errores)) {
        return;
    }

    res.locals.requerida = datos;

    next();
}

// Validación específica para registrar una habilidad ofrecida.
export function validarCrearOfrecida(req, res, next) {
    return validarDatosOfrecida(req, res, next, false);
}

// Validación específica para actualizar una habilidad ofrecida.
export function validarActualizarOfrecida(req, res, next) {
    return validarDatosOfrecida(req, res, next, true);
}

// Validación específica para registrar una habilidad requerida.
export function validarCrearRequerida(req, res, next) {
    return validarDatosRequerida(req, res, next, false);
}

// Validación específica para actualizar una habilidad requerida.
export function validarActualizarRequerida(req, res, next) {
    return validarDatosRequerida(req, res, next, true);
}
