import { crearApagado } from './apagado.js';

// Punto de entrada del backend.
//
// El arranque es deliberadamente estricto: si la configuración del entorno es
// inválida (por ejemplo, falta JWT_SECRET), el proceso no inicia y se muestra
// un mensaje claro en lugar de fallar más adelante al firmar un token.
//
// En producción este proceso también sirve la SPA compilada (frontend/dist),
// así que la aplicación se despliega como un único servicio.
//
// La carga de módulos se hace de forma dinámica para poder capturar y reportar
// los errores de configuración con un mensaje legible.

// Recursos que necesita el apagado. Se declaran antes de registrar las señales
// para que un SIGTERM durante el arranque no deje el proceso colgado.
let servidor = null;
let pool = null;
let cerrarEventos = null;

const apagar = crearApagado({
    obtenerServidor: () => servidor,
    obtenerPool: () => pool,
    cerrarEventos: () => cerrarEventos?.()
});

// Railway y Docker detienen el contenedor con SIGTERM; SIGINT cubre el caso de
// ejecutarlo a mano en la terminal.
process.on('SIGTERM', () => void apagar('SIGTERM'));
process.on('SIGINT', () => void apagar('SIGINT'));

async function startServer() {
    try {
        const { env } = await import('./config/env.js');

        // Advertencias de configuración: nunca incluyen valores sensibles.
        for (const advertencia of env.advertencias) {
            console.warn(`Advertencia de configuración: ${advertencia}`);
        }

        const databaseModule = await import('./config/database.js');
        const eventosModule = await import(
            './modules/eventos/eventos.registro.js'
        );
        const { default: app } = await import('./app.js');

        pool = databaseModule.pool;
        cerrarEventos = eventosModule.cerrarTodos;

        const database = await databaseModule.testDatabaseConnection();

        console.log(
            `Conexión correcta con la base de datos: ${database.database_name}`
        );

        // PORT lo inyecta la plataforma (Railway asigna uno dinámico) y HOST
        // por defecto es 0.0.0.0: dentro de un contenedor el proxy entra por la
        // interfaz pública, no por 127.0.0.1.
        servidor = app.listen(env.port, env.host, () => {
            console.log(
                `Backend de SkillMatch escuchando en http://${env.host}:${env.port}`
            );
        });

        servidor.on('error', (error) => {
            console.error('No fue posible iniciar el servidor:', error.message);
            void apagar('error del servidor', 1);
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
