/**
 * Indicador de carga reutilizable.
 * Mantiene el mismo alto que las tarjetas para evitar saltos de diseño.
 */
export default function Cargando({ mensaje = 'Cargando información…' }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-slate-800 bg-surface p-8 text-center text-sm text-text-muted"
        >
            <span
                aria-hidden="true"
                className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-primary align-[-2px]"
            />
            {mensaje}
        </div>
    );
}
