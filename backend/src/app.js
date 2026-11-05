import express from 'express';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import categoriasRoutes from './modules/categorias/categorias.routes.js';
import habilidadesRoutes from './modules/habilidades/habilidades.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';

const app = express();

app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Yujuuuuu! El backend de SkillMatch está funcionando.'
    });
});

// Aquí se registran las rutas de los módulos. Las rutas deben estar antes de notFound y errorHandler para que puedan ser manejadas correctamente.

app.use('/api/categorias', categoriasRoutes);
app.use('/api/habilidades', habilidadesRoutes);
app.use('api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;