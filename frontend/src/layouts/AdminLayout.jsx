import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-text-main">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-surface/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
                <Link
                to="/"
                className="text-xl font-bold tracking-tight text-primary transition hover:text-primary-dark"
                >
                SkillMatch
                </Link>

                <p className="text-sm text-text-muted">
                Intercambio de habilidades y conocimientos
                </p>
            </div>

            <nav className="flex items-center gap-2 sm:gap-3">
                <Link
                to="/admin/categorias"
                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                >
                Categorías
                </Link>

                <span className="hidden rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-medium text-accent sm:inline-block">
                Administración
                </span>
            </nav>
            </div>
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