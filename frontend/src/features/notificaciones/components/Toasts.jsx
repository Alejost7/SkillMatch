import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useEventos } from '../useEventos.js';

// Tiempo que un aviso permanece en pantalla.
const DURACION_MS = 6000;

function Aviso({ aviso, onDescartar }) {
    useEffect(() => {
        const temporizador = setTimeout(() => {
            onDescartar(aviso.id);
        }, DURACION_MS);

        return () => clearTimeout(temporizador);
    }, [aviso.id, onDescartar]);

    return (
        <div
            role="status"
            className="pointer-events-auto rounded-xl border border-slate-700 bg-surface p-3 shadow-xl"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-main">
                        {aviso.titulo}
                    </p>

                    {aviso.detalle && (
                        <p className="mt-1 truncate text-xs text-text-muted">
                            {aviso.detalle}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onDescartar(aviso.id)}
                    aria-label="Cerrar aviso"
                    className="text-lg leading-none text-text-muted hover:text-text-main"
                >
                    ×
                </button>
            </div>

            {aviso.ruta && (
                <Link
                    to={aviso.ruta}
                    onClick={() => onDescartar(aviso.id)}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                >
                    Ver detalle
                </Link>
            )}
        </div>
    );
}

/**
 * Avisos flotantes de los eventos en tiempo real.
 * Se muestran en la esquina inferior derecha y se cierran solos.
 */
export default function Toasts() {
    const { avisos, descartarAviso } = useEventos();

    if (avisos.length === 0) {
        return null;
    }

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
        >
            {avisos.map((aviso) => (
                <Aviso
                    key={aviso.id}
                    aviso={aviso}
                    onDescartar={descartarAviso}
                />
            ))}
        </div>
    );
}
