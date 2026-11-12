import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    password: env.database.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    charset: 'utf8mb4',
    // TLS sólo cuando DB_SSL está activo. La clave se omite por completo en
    // desarrollo para que mysql2 no intente negociar SSL contra un MySQL local.
    ...(env.database.ssl ? { ssl: env.database.ssl } : {})
});

export async function testDatabaseConnection() {
    try {
        const [rows] = await pool.execute(
            'SELECT DATABASE() AS database_name, 1 AS connection_ok'
        );

        return rows[0];
    } catch (error) {
        // Los errores de TLS son el fallo más habitual al desplegar: el mensaje
        // de MySQL no dice qué variable corregir, así que se añade la pista.
        if (/ssl|tls|certificate|handshake/i.test(error.message)) {
            throw new Error(
                `${error.message} Revisa DB_SSL: los servidores gestionados (Railway incluido) exigen DB_SSL=true.`
            );
        }

        throw error;
    }
}
