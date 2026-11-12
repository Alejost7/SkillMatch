/**
 * Estado vacío para listados y paneles.
 * Recibe el título y, opcionalmente, una explicación o una acción.
 */
export default function EstadoVacio({ titulo, children }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-surface/60 px-6 py-12 text-center">
            <h2 className="font-semibold text-text-main">{titulo}</h2>

            {children && (
                <div className="mx-auto mt-2 max-w-md text-sm text-text-muted">
                    {children}
                </div>
            )}
        </div>
    );
}
