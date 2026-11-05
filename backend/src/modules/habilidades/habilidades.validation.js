// Validaciones del módulo de habilidades.

// Valida que el identificador recibido por parámetro sea válido.
export function validarIdHabilidad(req, res, next) {
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

    // Guardamos el id validado para usarlo en el controlador.
    res.locals.idHabilidad = id;
    next();
}

// Valida el parámetro opcional categoriaId usado para filtrar habilidades.
export function validarFiltroCategoria(req, res, next) {
    const { categoriaId } = req.query;

    // Si no se envía el filtro, continuamos sin filtrar.
    if (categoriaId === undefined) {
        res.locals.idCategoria = null;
        return next();
    }

    const id = Number(categoriaId);

    if (
        !/^[1-9]\d*$/.test(categoriaId) ||
        !Number.isSafeInteger(id) ||
        id > 4294967295
    ) {
        return res.status(400).json({
        success: false,
        message: 'El parámetro categoriaId debe ser un entero positivo válido.'
        });
    }

    res.locals.idCategoria = id;
    next();
}

// Función interna para validar los datos de creación o actualización.
function validarDatosHabilidad(req, res, next, esActualizacion) {
    const body = req.body;

    // Verificamos que el cliente haya enviado un objeto JSON válido.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
        success: false,
        message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];
    const camposPermitidos = ['idCategoria', 'nombre', 'descripcion', 'estado'];

    // Detectamos campos que no pertenecen al recurso habilidad.
    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(
        `Campos no permitidos: ${camposDesconocidos.join(', ')}.`
        );
    }

    // En actualización, todos los campos son obligatorios.
    if (esActualizacion) {
        for (const campo of camposPermitidos) {
        if (!Object.prototype.hasOwnProperty.call(body, campo)) {
            errores.push(`El campo ${campo} es obligatorio para actualizar.`);
        }
        }
    }

    // Validamos el identificador de la categoría.
    const idCategoria = Number(body.idCategoria);

    if (
        !Number.isInteger(idCategoria) ||
        idCategoria <= 0 ||
        idCategoria > 4294967295
    ) {
        errores.push(
        'El campo idCategoria debe ser un entero positivo válido.'
        );
    }

    // Validamos el nombre de la habilidad.
    const nombre =
        typeof body.nombre === 'string' ? body.nombre.trim() : '';

    if (nombre.length === 0 || [...nombre].length > 100) {
        errores.push('El nombre debe tener entre 1 y 100 caracteres.');
    }

    // Validamos la descripción opcional.
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

    // El estado es opcional al crear; por defecto será activo.
    const estado =
        body.estado === undefined && !esActualizacion
        ? 'activo'
        : body.estado;

    if (!['activo', 'inactivo'].includes(estado)) {
        errores.push('El estado debe ser activo o inactivo.');
    }

    // Si hay errores, respondemos con 400 y no continuamos.
    if (errores.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
        });
    }

    // Preparamos los datos limpios para el servicio.
    res.locals.habilidad = {
        idCategoria,
        nombre,
        descripcion:
        typeof descripcion === 'string'
            ? descripcion.trim() || null
            : null,
        estado
    };

    next();
}

// Validación específica para crear una habilidad.
export function validarCrearHabilidad(req, res, next) {
    return validarDatosHabilidad(req, res, next, false);
}

// Validación específica para actualizar una habilidad.
export function validarActualizarHabilidad(req, res, next) {
    return validarDatosHabilidad(req, res, next, true);
}