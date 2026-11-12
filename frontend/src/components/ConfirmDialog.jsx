import { useEffect, useRef } from 'react';

/**
 * Diálogo modal de confirmación con el tema oscuro de SkillMatch.
 *
 * Se usa para acciones destructivas o irreversibles (eliminar registros,
 * finalizar un intercambio). El error del backend se muestra dentro del
 * diálogo para que el usuario pueda corregir sin cerrarlo.
 */
export default function ConfirmDialog({
    titulo = 'Confirmar acción',
    descripcion,
    nombre,
    textoConfirmar = 'Sí, continuar',
    textoOcupado = 'Procesando…',
    textoCancelar = 'Cancelar',
    peligro = true,
    ocupado = false,
    error = '',
    onCancel,
    onConfirm
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        dialog.showModal();

        return () => {
            dialog.close();
        };
    }, []);

    function manejarEscape(event) {
        event.preventDefault();

        if (!ocupado) {
            onCancel();
        }
    }

    const botonConfirmar = peligro
        ? 'bg-danger text-white hover:bg-danger/90'
        : 'bg-primary text-slate-950 hover:bg-primary-dark';

    return (
        <dialog
            ref={dialogRef}
            onCancel={manejarEscape}
            aria-labelledby="confirmar-accion-titulo"
            aria-describedby="confirmar-accion-descripcion"
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-700 bg-surface p-6 text-text-main shadow-2xl backdrop:bg-slate-950/70"
        >
            <h2
                id="confirmar-accion-titulo"
                className="text-xl font-bold text-text-main"
            >
                {titulo}
            </h2>

            <p
                id="confirmar-accion-descripcion"
                className="mt-3 text-sm text-text-muted"
            >
                {descripcion ??
                    `¿Deseas continuar con esta acción${nombre ? ` sobre «${nombre}»` : ''}? Esta acción no se puede deshacer.`}
            </p>

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger"
                >
                    {error}
                </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    autoFocus
                    disabled={ocupado}
                    onClick={onCancel}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main hover:bg-slate-800 disabled:opacity-50"
                >
                    {textoCancelar}
                </button>

                <button
                    type="button"
                    disabled={ocupado}
                    onClick={onConfirm}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${botonConfirmar}`}
                >
                    {ocupado ? textoOcupado : textoConfirmar}
                </button>
            </div>
        </dialog>
    );
}
