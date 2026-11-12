import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../useAuth.js';

/**
 * Envuelve las rutas privadas.
 *
 * - Sin sesión redirige al inicio de sesión recordando la ruta solicitada.
 * - Con "rol" exige ese rol; en caso contrario vuelve al panel del usuario.
 *
 * La sesión se lee de localStorage en el primer render, así que no hace falta
 * un estado de carga: la decisión es inmediata.
 */
export default function ProtectedRoute({ rol }) {
    const { autenticado, usuario, expirada } = useAuth();
    const ubicacion = useLocation();

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ desde: ubicacion.pathname, expirada }}
            />
        );
    }

    if (rol && usuario?.rol !== rol) {
        return (
            <Navigate
                to="/app"
                replace
                state={{
                    aviso: 'No tienes permisos para entrar a la administración.'
                }}
            />
        );
    }

    return <Outlet />;
}
