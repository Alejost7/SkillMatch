import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(
    new URL('../../.env', import.meta.url)
);

dotenv.config({ path: envPath });

const requiredVariables = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]?.trim()) {
        throw new Error(
        `Falta configurar la variable de entorno: ${variable}`
        );
    }
}

function parsePort(value, variableName) {
    const port = Number(value);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(
        `La variable ${variableName} debe ser un puerto válido.`
        );
    }

    return port;
}

export const env = {
    port: parsePort(process.env.PORT ?? '3000', 'PORT'),
    database: {
        host: process.env.DB_HOST,
        port: parsePort(process.env.DB_PORT ?? '3306', 'DB_PORT'),
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }
};