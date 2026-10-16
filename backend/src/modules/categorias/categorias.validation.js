export function validarIdCategoria(req, res, next) {
    const valor = req.params.id;
    const id = Number(valor);

    if (
        !/^[1-9]\d*$/.test(valor) ||
        !Number.isSafeInteger(id) ||
        id > 4294967295
    ) {
        return res.status(400).json({
        success: false,
        message: 'El identificador debe ser un entero positivo válido.'
        });
    }

    res.locals.idCategoria = id;
    next();
}

function validarDatosCategoria(req, res, next, esActualizacion) {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
        success: false,
        message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];
    const camposPermitidos = ['nombre', 'descripcion', 'estado'];

    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(
        `Campos no permitidos: ${camposDesconocidos.join(', ')}.`
        );
    }

    if (esActualizacion) {
        for (const campo of camposPermitidos) {
        if (!Object.prototype.hasOwnProperty.call(body, campo)) {
            errores.push(`El campo ${campo} es obligatorio para actualizar.`);
        }
        }
    }

    const nombre =
        typeof body.nombre === 'string' ? body.nombre.trim() : '';

    if (nombre.length === 0 || [...nombre].length > 80) {
        errores.push('El nombre debe tener entre 1 y 80 caracteres.');
    }

    const { descripcion } = body;

    if (
        descripcion !== undefined &&
        descripcion !== null &&
        (
        typeof descripcion !== 'string' ||
        [...descripcion.trim()].length > 255
        )
    ) {
        errores.push('La descripción debe ser texto de hasta 255 caracteres.');
    }

    const estado = body.estado === undefined && !esActualizacion
        ? 'activo'
        : body.estado;

    if (!['activo', 'inactivo'].includes(estado)) {
        errores.push('El estado debe ser activo o inactivo.');
    }

    if (errores.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
        });
    }

    res.locals.categoria = {
        nombre,
        descripcion:
        typeof descripcion === 'string'
            ? descripcion.trim() || null
            : null,
        estado
    };

    next();
}

export function validarCrearCategoria(req, res, next) {
    return validarDatosCategoria(req, res, next, false);
}

export function validarActualizarCategoria(req, res, next) {
    return validarDatosCategoria(req, res, next, true);
}