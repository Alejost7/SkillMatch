const ESTILO_BASE =
    'mt-2 w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-sm text-text-main focus:outline-none focus:ring-2';

/**
 * Select con etiqueta, ayuda y error.
 * opciones: [{ valor, etiqueta }].
 */
export default function CampoSelect({
    id,
    label,
    error,
    ayuda,
    opciones = [],
    placeholder,
    className = '',
    ...selectProps
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

            <select
                id={id}
                aria-invalid={Boolean(error)}
                aria-describedby={descripciones || undefined}
                className={`${ESTILO_BASE} ${
                    error
                        ? 'border-danger focus:ring-danger'
                        : 'border-slate-700 focus:ring-primary'
                }`}
                {...selectProps}
            >
                {placeholder && <option value="">{placeholder}</option>}

                {opciones.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                    </option>
                ))}
            </select>

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
