import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import categoriasRoutes from './modules/categorias/categorias.routes.js';
import habilidadesRoutes from './modules/habilidades/habilidades.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import habilidadesUsuarioRoutes from './modules/habilidades-usuario/habilidades-usuario.routes.js';
import solicitudesRoutes from './modules/solicitudes/solicitudes.routes.js';
import conexionesRoutes from './modules/conexiones/conexiones.routes.js';
import mensajesRoutes from './modules/mensajes/mensajes.routes.js';
import calificacionesRoutes from './modules/calificaciones/calificaciones.routes.js';
import eventosRoutes from './modules/eventos/eventos.routes.js';

const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'El backend de SkillMatch está funcionando correctamente.'
    });
});

// Aquí se registran las rutas de los módulos. Las rutas deben estar antes de notFound y errorHandler para que puedan ser manejadas correctamente.

app.use('/api/categorias', categoriasRoutes);
app.use('/api/habilidades', habilidadesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/habilidades-usuario', habilidadesUsuarioRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/conexiones', conexionesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/eventos', eventosRoutes);

// ---------------------------------------------------------------------------
// Frontend compilado (despliegue de un solo servicio).
//
// En producción este mismo proceso sirve la SPA que genera `npm run build`.
// Si la carpeta no existe (desarrollo con Vite en su propio puerto) el bloque
// se omite y el backend queda como API pura.
//
// La ruta se calcula desde este archivo para que funcione igual en local
// (backend/src/app.js -> ../../frontend/dist) y dentro del contenedor
// (/app/backend/src/app.js -> /app/frontend/dist).
// ---------------------------------------------------------------------------
const carpetaFrontend = fileURLToPath(
    new URL('../../frontend/dist', import.meta.url)
);
const archivoIndex = path.join(carpetaFrontend, 'index.html');

if (existsSync(archivoIndex)) {
    app.use(
        express.static(carpetaFrontend, {
            // index.html se entrega con el fallback, que controla el caché.
            index: false,
            // Vite añade un hash al nombre de cada archivo de /assets, así que
            // esos se pueden cachear indefinidamente.
            setHeaders(res, rutaArchivo) {
                if (rutaArchivo.includes(`${path.sep}assets${path.sep}`)) {
                    res.setHeader(
                        'Cache-Control',
                        'public, max-age=31536000, immutable'
                    );
                }
            }
        })
    );

    // Fallback de React Router: una navegación del navegador a /app, /login o
    // /politica-datos debe devolver index.html, no un 404.
    app.use((req, res, next) => {
        const esLectura = req.method === 'GET' || req.method === 'HEAD';

        // La API conserva sus propios 404 en JSON.
        if (!esLectura || req.path.startsWith('/api')) {
            return next();
        }

        // Sólo se responde HTML cuando el cliente lo pide explícitamente: así
        // curl, los tests (Accept: */*) y cualquier herramienta siguen
        // recibiendo el 404 en JSON en lugar de la SPA.
        if (!req.headers.accept?.includes('text/html')) {
            return next();
        }

        res.setHeader('Cache-Control', 'no-cache');

        return res.sendFile(archivoIndex, (error) => {
            if (error) {
                next(error);
            }
        });
    });
} else {
    console.warn(
        'No se encontró frontend/dist: el backend se ejecuta sólo como API. Ejecuta `npm run build` en frontend/ para servir la aplicación completa.'
    );
}

app.use(notFound);
app.use(errorHandler);

export default app;