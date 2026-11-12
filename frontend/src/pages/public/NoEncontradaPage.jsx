import { Link } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth.js';

/**
 * Página para direcciones que no existen.
 * Ofrece una salida según haya sesión activa o no.
 */
export default function NoEncontradaPage() {
    const { autenticado } = useAuth();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-text-main">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Error 404
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                No encontramos esta página
            </h1>

            <p className="mt-3 max-w-md text-text-muted">
                La dirección que abriste no existe o fue movida. Revisa el
                enlace o vuelve al inicio.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    to="/"
                    className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
                >
                    Ir al inicio
                </Link>

                <Link
                    to={autenticado ? '/app' : '/login'}
                    className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-text-main transition hover:bg-slate-800"
                >
                    {autenticado ? 'Ir a mi panel' : 'Iniciar sesión'}
                </Link>
            </div>
        </div>
    );
}
