// Punto de entrada del backend.
//
// El arranque es deliberadamente estricto: si la configuración del entorno es
// inválida (por ejemplo, falta JWT_SECRET), el proceso no inicia y se muestra
// un mensaje claro en lugar de fallar más adelante al firmar un token.

// La carga de módulos se hace de forma dinámica para poder capturar y reportar
// los errores de configuración con un mensaje legible.
async function startServer() {
    let pool = null;

    try {
        const { env } = await import('./config/env.js');

        // Advertencias de configuración: nunca incluyen valores sensibles.
        for (const advertencia of env.advertencias) {
            console.warn(`Advertencia de configuración: ${advertencia}`);
        }

        const databaseModule = await import('./config/database.js');
        const { default: app } = await import('./app.js');

        pool = databaseModule.pool;

        const database = await databaseModule.testDatabaseConnection();

        console.log(
            `Conexión correcta con la base de datos: ${database.database_name}`
        );

        const server = app.listen(env.port, '127.0.0.1', () => {
            console.log(
                `Backend de SkillMatch escuchando en http://127.0.0.1:${env.port}`
            );
        });

        server.on('error', async (error) => {
            console.error('No fue posible iniciar el servidor:', error.message);
            await pool.end();
            process.exitCode = 1;
        });
    } catch (error) {
        console.error('No fue posible iniciar el backend:', error.message);

        if (pool) {
            await pool.end().catch(() => {});
        }

        process.exitCode = 1;
    }
}

startServer();
