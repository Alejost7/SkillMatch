const ESTILO_BASE =
    'mt-2 w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2';

/**
 * Área de texto con etiqueta, ayuda y contador opcional.
 */
export default function CampoArea({
    id,
    label,
    error,
    ayuda,
    maximo,
    valor = '',
    className = '',
    rows = 3,
    ...textareaProps
}) {
    const descripciones = [
        ayuda ? `${id}-ayuda` : null,
        error ? `${id}-error` : null
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm font-medium text-text-main">
                {label}
            </label>

            <textarea
                id={id}
                rows={rows}
                value={valor}
                aria-invalid={Boolean(error)}
                aria-describedby={descripciones || undefined}
                className={`${ESTILO_BASE} ${
                    error
                        ? 'border-danger focus:ring-danger'
                        : 'border-slate-700 focus:ring-primary'
                }`}
                {...textareaProps}
            />

            {ayuda && !error && (
                <p id={`${id}-ayuda`} className="mt-1 text-xs text-text-muted">
                    {ayuda}
                    {maximo ? ` Actual: ${[...valor].length}/${maximo}.` : ''}
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
