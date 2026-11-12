/**
 * Navegación de páginas para los listados paginados por el backend.
 * "paginacion" es el objeto que devuelve la API:
 * { pagina, limite, total, totalPaginas, tieneAnterior, tieneSiguiente }.
 */
export default function Paginacion({
    paginacion,
    onAnterior,
    onSiguiente,
    deshabilitado = false
}) {
    if (!paginacion) {
        return null;
    }

    const { pagina, total, totalPaginas, tieneAnterior, tieneSiguiente } =
        paginacion;

    return (
        <nav
            aria-label="Paginación de resultados"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-surface px-4 py-3 text-sm"
        >
            <p className="text-text-muted">
                {total} {total === 1 ? 'registro' : 'registros'} · Página{' '}
                {pagina} de {Math.max(totalPaginas, 1)}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onAnterior}
                    disabled={deshabilitado || !tieneAnterior}
                    className="rounded-lg border border-slate-700 px-3 py-2 font-medium text-text-main transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Anterior
                </button>

                <button
                    type="button"
                    onClick={onSiguiente}
                    disabled={deshabilitado || !tieneSiguiente}
                    className="rounded-lg border border-slate-700 px-3 py-2 font-medium text-text-main transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente
                </button>
            </div>
        </nav>
    );
}
