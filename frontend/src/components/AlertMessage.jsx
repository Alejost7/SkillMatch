const ESTILOS = {
    error: 'border-danger/40 bg-danger/10 text-danger',
    success: 'border-success/40 bg-success/10 text-success',
    info: 'border-primary/40 bg-primary/10 text-primary'
};

/**
 * Mensaje de aviso con el tema oscuro de SkillMatch.
 * type: "error" | "success" | "info".
 */
export default function AlertMessage({ type = 'error', children }) {
    const estilos = ESTILOS[type] ?? ESTILOS.error;

    return (
        <div
            role={type === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm ${estilos}`}
        >
            {children}
        </div>
    );
}
