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
    charset: 'utf8mb4'
});

export async function testDatabaseConnection() {
    const [rows] = await pool.execute(
        'SELECT DATABASE() AS database_name, 1 AS connection_ok'
    );

    return rows[0];
}