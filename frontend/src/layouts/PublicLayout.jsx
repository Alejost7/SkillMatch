import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth.js';

export default function PublicLayout() {
    const { autenticado, esAdministrador } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-background text-text-main">
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-surface/95 backdrop-blur">
                <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-tight text-primary transition hover:text-primary-dark"
                    >
                        SkillMatch
                    </Link>

                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                        {autenticado ? (
                            <>
                                {esAdministrador && (
                                    <Link
                                        to="/admin/categorias"
                                        className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/20 sm:px-4"
                                    >
                                        Administración
                                    </Link>
                                )}

                                <Link
                                    to="/app"
                                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark sm:px-4"
                                >
                                    Mi panel
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 sm:px-4"
                                >
                                    Iniciar sesión
                                </Link>

                                <Link
                                    to="/registro"
                                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark sm:px-4"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-slate-800 bg-surface">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-text-muted sm:flex-row sm:px-6">
                    <p>
                        © {new Date().getFullYear()} SkillMatch. Todos los
                        derechos reservados.
                    </p>

                    <Link
                        to="/politica-datos"
                        className="transition hover:text-primary"
                    >
                        Política de tratamiento de datos
                    </Link>
                </div>
            </footer>
        </div>
    );
}
