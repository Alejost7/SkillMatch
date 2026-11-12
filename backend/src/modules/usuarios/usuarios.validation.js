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

// Campos que se guardan en la tabla usuario.
const CAMPOS_BASICOS = ['nombres', 'apellidos', 'alias'];

// Campos que se guardan en la tabla perfil.
const CAMPOS_PERFIL = [
    'biografia',
    'fotoPerfilUrl',
    'disponibilidad',
    'ciudad',
    'pais'
];

// Campos de texto libre de la tabla perfil, con su longitud máxima.
// Las longitudes coinciden con las columnas definidas en database/shema.sql.
const TEXTOS_PERFIL = [
    { campo: 'biografia', maximo: 1000, etiqueta: 'La biografía' },
    { campo: 'disponibilidad', maximo: 100, etiqueta: 'La disponibilidad' },
    { campo: 'ciudad', maximo: 80, etiqueta: 'La ciudad' },
    { campo: 'pais', maximo: 80, etiqueta: 'El país' }
];

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

    const camposPermitidos = [...CAMPOS_BASICOS, ...CAMPOS_PERFIL];

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

    const datosPerfil = validarCamposPerfil(body, errores);

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

    res.locals.datosPerfil = datosPerfil;

    next();
}

// Valida los campos opcionales de la tabla perfil.
// Solo se devuelven las claves que el cliente envió, para no borrar el resto.
// Un texto vacío o null permite limpiar el campo a propósito.
function validarCamposPerfil(body, errores) {
    const datosPerfil = {};

    for (const { campo, maximo, etiqueta } of TEXTOS_PERFIL) {
        if (!Object.hasOwn(body, campo)) {
            continue;
        }

        const valor = body[campo];

        if (valor === null) {
            datosPerfil[campo] = null;
            continue;
        }

        if (typeof valor !== 'string') {
            errores.push(`${etiqueta} debe ser texto.`);
            continue;
        }

        const limpio = valor.trim();

        if (limpio.length === 0) {
            datosPerfil[campo] = null;
        } else if (limpio.length > maximo) {
            errores.push(`${etiqueta} debe tener máximo ${maximo} caracteres.`);
        } else {
            datosPerfil[campo] = limpio;
        }
    }

    if (Object.hasOwn(body, 'fotoPerfilUrl')) {
        const valor = body.fotoPerfilUrl;

        if (valor === null) {
            datosPerfil.fotoPerfilUrl = null;
        } else if (typeof valor !== 'string') {
            errores.push('La foto de perfil debe ser una URL en texto.');
        } else {
            const limpio = valor.trim();

            if (limpio.length === 0) {
                datosPerfil.fotoPerfilUrl = null;
            } else if (limpio.length > 255) {
                errores.push(
                    'La foto de perfil debe tener máximo 255 caracteres.'
                );
            } else if (!/^https?:\/\/\S+$/i.test(limpio)) {
                errores.push(
                    'La foto de perfil debe ser una URL que inicie con http:// o https://.'
                );
            } else {
                datosPerfil.fotoPerfilUrl = limpio;
            }
        }
    }

    return datosPerfil;
}