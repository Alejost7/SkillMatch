// Configuración central del backend.
// Carga el archivo .env y valida que las variables necesarias existan y tengan
// un formato correcto. Si falta algo, el backend no arranca y el error indica
// exactamente qué variable debe corregirse. Nunca se imprimen los valores.

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(
    new URL('../../.env', import.meta.url)
);

// quiet evita que dotenv escriba mensajes propios en la consola y las pruebas.
dotenv.config({ path: envPath, quiet: true });

// Valor de ejemplo publicado en .env.example. No es un secreto real.
const SECRETO_DE_EJEMPLO = 'cambia_esta_clave_en_produccion';

// Los secretos demasiado cortos son fáciles de adivinar.
export const LONGITUD_MINIMA_SECRETO = 16;

// jsonwebtoken acepta valores como 1h, 30m, 7d o un número de milisegundos.
const PATRON_EXPIRACION = /^\d+[smhd]?$/;

const VARIABLES_OBLIGATORIAS = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
];

function leerVariable(origen, nombre) {
    const valor = origen[nombre];

    return typeof valor === 'string' ? valor.trim() : '';
}

function validarPuerto(origen, nombre, valorPorDefecto, errores) {
    const valor = origen[nombre];
    const texto = valor === undefined || valor === null
        ? valorPorDefecto
        : String(valor).trim();
    const puerto = Number(texto);

    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
        errores.push(
            `La variable ${nombre} debe ser un puerto válido entre 1 y 65535.`
        );
        return null;
    }

    return puerto;
}

function validarExpiracion(origen, errores) {
    const texto = leerVariable(origen, 'JWT_EXPIRES_IN');

    if (!texto) {
        return '1h';
    }

    if (!PATRON_EXPIRACION.test(texto)) {
        errores.push(
            'La variable JWT_EXPIRES_IN debe usar el formato de jsonwebtoken, por ejemplo 1h, 30m o 7d.'
        );
        return null;
    }

    return texto;
}

/**
 * Valida un objeto de variables (por defecto process.env) y devuelve la
 * configuración tipada del backend.
 *
 * Se exporta como función para poder probarla con objetos controlados sin
 * depender del archivo .env real.
 */
export function cargarConfig(origen = process.env) {
    const errores = [];
    const advertencias = [];
    const valores = {};

    for (const variable of VARIABLES_OBLIGATORIAS) {
        valores[variable] = leerVariable(origen, variable);

        if (!valores[variable]) {
            errores.push(`Falta configurar la variable de entorno: ${variable}`);
        }
    }

    if (
        valores.JWT_SECRET &&
        valores.JWT_SECRET.length < LONGITUD_MINIMA_SECRETO
    ) {
        errores.push(
            `La variable JWT_SECRET debe tener al menos ${LONGITUD_MINIMA_SECRETO} caracteres.`
        );
    }

    if (valores.JWT_SECRET === SECRETO_DE_EJEMPLO) {
        advertencias.push(
            'JWT_SECRET todavía usa el valor de ejemplo; cámbialo antes de publicar la aplicación.'
        );
    }

    const configuracion = {
        port: validarPuerto(origen, 'PORT', '3000', errores),
        database: {
            host: valores.DB_HOST,
            port: validarPuerto(origen, 'DB_PORT', '3306', errores),
            name: valores.DB_NAME,
            user: valores.DB_USER,
            password: valores.DB_PASSWORD
        },
        jwt: {
            secret: valores.JWT_SECRET,
            expiresIn: validarExpiracion(origen, errores)
        },
        advertencias
    };

    if (errores.length > 0) {
        const detalle = errores.map((error) => ` - ${error}`).join('\n');

        throw new Error(`Configuración de entorno inválida:\n${detalle}`);
    }

    return configuracion;
}

export const env = cargarConfig(process.env);