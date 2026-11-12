import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import MenuMovil from '../components/MenuMovil.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import IndicadorConexion from '../features/notificaciones/components/IndicadorConexion.jsx';
import PanelNotificaciones from '../features/notificaciones/components/PanelNotificaciones.jsx';
import Toasts from '../features/notificaciones/components/Toasts.jsx';
import { iniciales, nombreCompleto } from '../utils/formato.js';

// Enlaces del panel privado. "exacto" evita que Inicio quede activo siempre.
const ENLACES = [
    { destino: '/app', texto: 'Inicio', exacto: true },
    { destino: '/app/buscar', texto: 'Buscar' },
    { destino: '/app/habilidades', texto: 'Mis habilidades' },
    { destino: '/app/solicitudes', texto: 'Solicitudes' },
    { destino: '/app/conexiones', texto: 'Conexiones' },
    { destino: '/app/mensajes', texto: 'Mensajes' },
    { destino: '/app/calificaciones', texto: 'Calificaciones' }
];

function claseEnlace({ isActive }) {
    const base =
        'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition';

    return isActive
        ? `${base} bg-primary/15 text-primary`
        : `${base} text-text-muted hover:bg-slate-800 hover:text-text-main`;
}

/**
 * Marco de todas las pantallas privadas: cabecera con notificaciones en vivo,
 * navegación principal y avisos flotantes.
 */
export default function PrivateLayout() {
    const { usuario, esAdministrador, cerrarSesion } = useAuth();
    const navegar = useNavigate();

    function salir() {
        cerrarSesion();
        navegar('/login', { replace: true });
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-text-main">
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-surface/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link
                        to="/app"
                        className="text-xl font-bold tracking-tight text-primary transition hover:text-primary-dark"
                    >
                        SkillMatch
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <IndicadorConexion />

                        <PanelNotificaciones />

                        <Link
                            to="/app/perfil"
                            className="flex items-center gap-2 rounded-lg border border-slate-700 py-1 pl-1 pr-3 transition hover:border-primary"
                            title="Mi perfil"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                {iniciales(usuario)}
                            </span>

                            <span className="hidden max-w-32 truncate text-sm text-text-main sm:block">
                                {nombreCompleto(usuario)}
                            </span>
                        </Link>

                        {esAdministrador && (
                            <Link
                                to="/admin/categorias"
                                className="hidden rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/20 sm:block"
                            >
                                Administración
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={salir}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-text-main transition hover:border-danger hover:text-danger"
                        >
                            Salir
                        </button>

                        {/* Solo en móvil: reemplaza a la barra horizontal. */}
                        <MenuMovil
                            enlaces={ENLACES}
                            ariaLabel="Navegación principal"
                        />
                    </div>
                </div>

                <nav
                    aria-label="Navegación principal"
                    className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 sm:px-6 md:flex"
                >
                    {ENLACES.map((enlace) => (
                        <NavLink
                            key={enlace.destino}
                            to={enlace.destino}
                            end={enlace.exacto}
                            className={claseEnlace}
                        >
                            {enlace.texto}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
                    <Outlet />
                </div>
            </main>

            <footer className="border-t border-slate-800 bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-text-muted sm:px-6">
                    SkillMatch · Intercambio de habilidades y conocimientos
                </div>
            </footer>

            <Toasts />
        </div>
    );
}
