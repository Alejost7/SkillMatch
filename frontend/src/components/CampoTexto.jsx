const ESTILO_BASE =
    'mt-2 w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2';

/**
 * Campo de texto con etiqueta, ayuda y error.
 * Agrupa el marcado accesible para no repetirlo en cada formulario.
 */
export default function CampoTexto({
    id,
    label,
    error,
    ayuda,
    className = '',
    ...inputProps
}) {
    const descripciones = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm font-medium text-text-main">
                {label}
            </label>

            <input
                id={id}
                aria-invalid={Boolean(error)}
                aria-describedby={descripciones || undefined}
                className={`${ESTILO_BASE} ${
                    error
                        ? 'border-danger focus:ring-danger'
                        : 'border-slate-700 focus:ring-primary'
                }`}
                {...inputProps}
            />

            {ayuda && !error && (
                <p id={`${id}-ayuda`} className="mt-1 text-xs text-text-muted">
                    {ayuda}
                </p>
            )}

            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
