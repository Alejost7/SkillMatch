// Validaciones del módulo de usuarios.

// Valida el identificador recibido en la URL.
export function validarIdUsuario(req, res, next) {
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

    res.locals.idUsuario = id;
    next();
}

// Valida la actualización del perfil del usuario autenticado.
export function validarActualizarPerfil(req, res, next) {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
        success: false,
        message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];

    const camposPermitidos = ['nombres', 'apellidos', 'alias'];

    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
    }

    const nombres = typeof body.nombres === 'string' ? body.nombres.trim() : '';

    if (nombres.length === 0 || nombres.length > 100) {
        errores.push('Los nombres deben tener entre 1 y 100 caracteres.');
    }

    const apellidos =
        typeof body.apellidos === 'string' ? body.apellidos.trim() : '';

    if (apellidos.length === 0 || apellidos.length > 100) {
        errores.push('Los apellidos deben tener entre 1 y 100 caracteres.');
    }

    let alias = null;

    if (body.alias !== undefined && body.alias !== null) {
        if (typeof body.alias !== 'string') {
        errores.push('El alias debe ser texto.');
        } else {
        alias = body.alias.trim();

        if (alias.length === 0) {
            alias = null;
        } else if (alias.length > 50) {
            errores.push('El alias debe tener máximo 50 caracteres.');
        }
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
        });
    }

    res.locals.datosUsuario = {
        nombres,
        apellidos,
        alias
    };

    next();
}