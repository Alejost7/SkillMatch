// Utilidades mínimas para probar middlewares de Express sin levantar un
// servidor ni tocar la base de datos.

// Crea un objeto de petición con lo mínimo que usan los middlewares.
export function crearReq({ body, params = {}, query = {}, headers = {} } = {}) {
    return { body, params, query, headers };
}

// Crea un objeto de respuesta que registra el estado y el cuerpo enviados.
export function crearRes() {
    const res = {
        statusCode: null,
        body: null,
        locals: {},
        headersSent: false,
        status(codigo) {
            res.statusCode = codigo;
            return res;
        },
        json(payload) {
            res.body = payload;
            return res;
        }
    };

    return res;
}

// Ejecuta un middleware síncrono y devuelve true si llamó a next().
export function ejecutarMiddleware(middleware, req, res) {
    let siguienteLlamado = false;

    middleware(req, res, () => {
        siguienteLlamado = true;
    });

    return siguienteLlamado;
}

// Espía de next() que registra si fue llamado y con qué argumento.
export function crearSiguiente() {
    const siguiente = (argumento) => {
        siguiente.llamado = true;
        siguiente.argumento = argumento;
    };

    siguiente.llamado = false;
    siguiente.argumento = undefined;

    return siguiente;
}
