export function FormField({
    id,
    label,
    error,
    type = 'text',
    className = '',
    ...inputProps
    }) {
    return (
        <div>
        <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-text-main"
        >
            {label}
        </label>

        <input
            id={id}
            type={type}
            className={`w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 ${
            error
                ? 'border-danger focus:ring-danger'
                : 'border-slate-700 focus:ring-primary'
            } ${className}`}
            {...inputProps}
        />

        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
    );
}