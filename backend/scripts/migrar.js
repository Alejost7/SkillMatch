// Ejecutor de migraciones de la base de datos.
//
// Uso:
//   npm run db:migrate               -> solo informa qué migraciones hay
//   npm run db:migrate -- --aplicar  -> las ejecuta en orden alfabético
//
// Los archivos deben ser idempotentes para que se puedan volver a ejecutar
// sin romper la base de datos. Nunca se imprimen credenciales: solo se informa
// el host, el puerto y el nombre de la base.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import mysql from 'mysql2/promise';

import { env } from '../src/config/env.js';

const directorioMigraciones = fileURLToPath(
    new URL('../../database/migrations', import.meta.url)
);

// Solo se aplican los cambios si el usuario lo pide explícitamente.
const aplicar = process.argv.includes('--aplicar');

async function listarMigraciones() {
    const archivos = await fs.readdir(directorioMigraciones);

    return archivos
        .filter((archivo) => archivo.toLowerCase().endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b, 'en'));
}

async function ejecutarMigraciones(migraciones) {
    const conexion = await mysql.createConnection({
        host: env.database.host,
        port: env.database.port,
        user: env.database.user,
        password: env.database.password,
        database: env.database.name,
        // Los archivos contienen varias sentencias (PREPARE / EXECUTE / SELECT).
        multipleStatements: true
    });

    try {
        for (const migracion of migraciones) {
            const ruta = path.join(directorioMigraciones, migracion);
            const sql = await fs.readFile(ruta, 'utf8');

            console.log(`Aplicando ${migracion}...`);

            const [resultados] = await conexion.query(sql);

            // Mostramos el resultado de las consultas de verificación.
            for (const resultado of resultados) {
                if (Array.isArray(resultado) && resultado.length > 0) {
                    console.log(resultado);
                }
            }

            console.log(`Migración aplicada: ${migracion}`);
        }
    } finally {
        await conexion.end();
    }
}

async function main() {
    const migraciones = await listarMigraciones();

    console.log(
        `Base de datos destino: ${env.database.host}:${env.database.port}/${env.database.name}`
    );

    if (migraciones.length === 0) {
        console.log('No hay migraciones en database/migrations.');
        return;
    }

    console.log(`Migraciones encontradas: ${migraciones.length}`);

    for (const migracion of migraciones) {
        console.log(` - ${migracion}`);
    }

    if (!aplicar) {
        console.log(
            'Modo revisión: no se aplicó ningún cambio. Ejecuta "npm run db:migrate -- --aplicar" para aplicarlas.'
        );
        return;
    }

    await ejecutarMigraciones(migraciones);

    console.log('Proceso de migraciones finalizado.');
}

main().catch((error) => {
    console.error('No fue posible ejecutar las migraciones:', error.message);
    process.exitCode = 1;
});
