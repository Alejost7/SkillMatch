import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
    nombre,
    ocupado,
    error,
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

    return (
        <dialog
        ref={dialogRef}
        onCancel={manejarEscape}
        aria-labelledby="confirmar-eliminacion-titulo"
        aria-describedby="confirmar-eliminacion-descripcion"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-white p-6 shadow-xl backdrop:bg-slate-900/50"
        >
        <h2
            id="confirmar-eliminacion-titulo"
            className="text-xl font-bold text-slate-900"
        >
            Eliminar categoría
        </h2>

        <p
            id="confirmar-eliminacion-descripcion"
            className="mt-3 text-sm text-slate-600"
        >
            ¿Deseas eliminar la categoría «{nombre}»?
            Esta acción no se puede deshacer.
        </p>

        {error && (
            <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
            Cancelar
            </button>

            <button
            type="button"
            disabled={ocupado}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
            {ocupado ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
        </div>
        </dialog>
    );
}