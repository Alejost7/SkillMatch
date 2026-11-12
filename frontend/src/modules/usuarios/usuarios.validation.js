// Validación del formulario de perfil.
// Repite las reglas del backend (usuarios.validation.js) para responder sin
// esperar la petición.

const PATRON_URL = /^https?:\/\/\S+$/i;

function validarTextoOpcional(errores, datos, campo, etiqueta, maximo) {
    const valor = datos[campo].trim();

    if ([...valor].length > maximo) {
        errores[campo] = `${etiqueta} no puede superar los ${maximo} caracteres.`;
    }
}

export function validarPerfil(datos) {
    const errores = {};

    const nombres = datos.nombres.trim();
    const apellidos = datos.apellidos.trim();
    const alias = datos.alias.trim();
    const fotoPerfilUrl = datos.fotoPerfilUrl.trim();

    if (!nombres) {
        errores.nombres = 'Los nombres son obligatorios.';
    } else if ([...nombres].length > 100) {
        errores.nombres = 'Los nombres no pueden superar los 100 caracteres.';
    }

    if (!apellidos) {
        errores.apellidos = 'Los apellidos son obligatorios.';
    } else if ([...apellidos].length > 100) {
        errores.apellidos =
            'Los apellidos no pueden superar los 100 caracteres.';
    }

    if ([...alias].length > 50) {
        errores.alias = 'El alias no puede superar los 50 caracteres.';
    }

    validarTextoOpcional(errores, datos, 'biografia', 'La biografía', 1000);
    validarTextoOpcional(
        errores,
        datos,
        'disponibilidad',
        'La disponibilidad',
        100
    );
    validarTextoOpcional(errores, datos, 'ciudad', 'La ciudad', 80);
    validarTextoOpcional(errores, datos, 'pais', 'El país', 80);

    if (fotoPerfilUrl) {
        if ([...fotoPerfilUrl].length > 255) {
            errores.fotoPerfilUrl =
                'La URL de la foto no puede superar los 255 caracteres.';
        } else if (!PATRON_URL.test(fotoPerfilUrl)) {
            errores.fotoPerfilUrl =
                'La URL debe iniciar con http:// o https://.';
        }
    }

    return errores;
}
