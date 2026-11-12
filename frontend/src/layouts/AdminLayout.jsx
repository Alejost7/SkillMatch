import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import MenuMovil from '../components/MenuMovil.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import { nombreCompleto } from '../utils/formato.js';

const ENLACES = [
    { destino: '/admin/categorias', texto: 'Categorías' },
    { destino: '/admin/habilidades', texto: 'Habilidades' }
];

function claseEnlace({ isActive }) {
    const base = 'rounded-lg px-3 py-2 text-sm font-medium transition';

    return isActive
        ? `${base} bg-primary/15 text-primary`
        : `${base} text-text-muted hover:bg-slate-800 hover:text-text-main`;
}

/**
 * Marco del panel administrativo.
 * Solo se muestra a usuarios con rol "administrador" (ver App.jsx).
 */
export default function AdminLayout() {
    const { usuario, cerrarSesion } = useAuth();
    const navegar = useNavigate();

    function salir() {
        cerrarSesion();
        navegar('/login', { replace: true });
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-text-main">
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-surface/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div>
                        <Link
                            to="/admin/categorias"
                            className="text-xl font-bold tracking-tight text-primary transition hover:text-primary-dark"
                        >
                            SkillMatch
                        </Link>

                        <p className="text-sm text-text-muted">
                            Panel de administración del catálogo
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="hidden rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent sm:inline-block">
                            {nombreCompleto(usuario)} · Administrador
                        </span>

                        <Link
                            to="/app"
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-text-main transition hover:border-primary hover:text-primary"
                        >
                            Mi panel
                        </Link>

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
                            ariaLabel="Navegación de administración"
                        />
                    </div>
                </div>

                <nav
                    aria-label="Navegación de administración"
                    className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 sm:px-6 md:flex"
                >
                    {ENLACES.map((enlace) => (
                        <NavLink
                            key={enlace.destino}
                            to={enlace.destino}
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
                <div className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-text-muted sm:px-6">
                    Panel administrativo de SkillMatch
                </div>
            </footer>
        </div>
    );
}
