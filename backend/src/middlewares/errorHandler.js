export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
        success: false,
        message: 'Nooooooo. El cuerpo de la petición contiene JSON inválido.'
        });
    }

    const status = error.status ?? error.statusCode;

    if ([404, 409].includes(status)) {
        return res.status(status).json({
        success: false,
        message: error.message
        });
    }

    if (Number.isInteger(status) && status >= 400 && status < 500) {
        return res.status(status).json({
        success: false,
        message: 'Uy! No se pudo procesar la petición.'
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: 'Lamentablemente, ocurrió un error interno en el servidor, :(.'
    });
}