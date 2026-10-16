import app from './app.js';
import { env } from './config/env.js';
import {
    pool,
    testDatabaseConnection
} from './config/database.js';

async function startServer() {
    try {
        const database = await testDatabaseConnection();

        console.log(
        `SIIIUUUU Conexión correcta con la base de datos: ${database.database_name}`
        );

        const server = app.listen(env.port, '127.0.0.1', () => {
        console.log(
            `Yujuuuuu! El backend de SkillMatch está funcionando en http://127.0.0.1:${env.port}`
        );
        });

        server.on('error', async (error) => {
        console.error('No fue posible iniciar el servidor:', error.message);
        await pool.end();
        process.exitCode = 1;
        });
    } catch (error) {
        console.error(
        'No fue posible conectar con la base de datos:',
        error.message
        );

        await pool.end();
        process.exitCode = 1;
    }
}

startServer();