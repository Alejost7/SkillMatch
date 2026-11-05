// Validaciones para registro e inicio de sesión.

/**
 * Valida los datos enviados para registrar un usuario.
 */
export function validarRegistro(req, res, next) {
    const body = req.body;

    // Verificamos que se haya enviado un objeto JSON.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
        success: false,
        message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];

    // Campos permitidos en el registro.
    const camposPermitidos = [
        'nombres',
        'apellidos',
        'correoElectronico',
        'contrasena',
        'alias'
    ];

    // Detectamos campos desconocidos.
    const camposDesconocidos = Object.keys(body).filter(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposDesconocidos.join(', ')}.`);
    }

    // Validamos nombres.
    const nombres = typeof body.nombres === 'string' ? body.nombres.trim() : '';

    if (nombres.length === 0 || nombres.length > 100) {
        errores.push('Los nombres deben tener entre 1 y 100 caracteres.');
    }

    // Validamos apellidos.
    const apellidos =
        typeof body.apellidos === 'string' ? body.apellidos.trim() : '';

    if (apellidos.length === 0 || apellidos.length > 100) {
        errores.push('Los apellidos deben tener entre 1 y 100 caracteres.');
    }

    // Validamos correo electrónico.
    const correoElectronico =
        typeof body.correoElectronico === 'string'
        ? body.correoElectronico.trim().toLowerCase()
        : '';

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoElectronico)) {
        errores.push('Debes enviar un correo electrónico válido.');
    }

    // Validamos contraseña.
    const contrasena =
        typeof body.contrasena === 'string' ? body.contrasena : '';

    if (contrasena.length < 8) {
        errores.push('La contraseña debe tener al menos 8 caracteres.');
    }

    // El alias es opcional.
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

    // Si hay errores, no continuamos.
    if (errores.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
        });
    }

    // Guardamos los datos limpios para el controlador.
    res.locals.usuario = {
        nombres,
        apellidos,
        correoElectronico,
        contrasena,
        alias
    };

    next();
    }

    /**
     * Valida los datos enviados para iniciar sesión.
     */
    export function validarLogin(req, res, next) {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
        success: false,
        message: 'Debes enviar un objeto JSON.'
        });
    }

    const errores = [];

    const correoElectronico =
        typeof body.correoElectronico === 'string'
        ? body.correoElectronico.trim().toLowerCase()
        : '';

    const contrasena =
        typeof body.contrasena === 'string' ? body.contrasena : '';

    if (!correoElectronico) {
        errores.push('El correo electrónico es obligatorio.');
    }

    if (!contrasena) {
        errores.push('La contraseña es obligatoria.');
    }

    if (errores.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'Hay errores en los datos enviados.',
        errors: errores
        });
    }

    res.locals.credenciales = {
        correoElectronico,
        contrasena
    };

    next();
}