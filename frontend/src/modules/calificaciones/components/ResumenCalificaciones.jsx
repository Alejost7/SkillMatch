import { formatearPromedio } from '../../../utils/formato.js';
import { PUNTUACIONES } from '../calificaciones.validation.js';

/**
 * Resumen de reputación: promedio, total y distribución por puntuación.
 */
export default function ResumenCalificaciones({ resumen }) {
    const total = resumen?.total ?? 0;
    const distribucion = resumen?.distribucion ?? {};

    return (
        <div className="rounded-2xl border border-slate-800 bg-surface p-6">
            <div className="flex flex-wrap items-end gap-3">
                <p className="text-4xl font-bold text-accent">
                    {total
                        ? formatearPromedio(resumen?.promedio, total)
                        : '—'}
                </p>

                <p className="pb-1 text-sm text-text-muted">
                    de 5 · {total}{' '}
                    {total === 1 ? 'calificación' : 'calificaciones'}
                </p>
            </div>

            <ul className="mt-4 space-y-2">
                {PUNTUACIONES.map((puntuacion) => {
                    const cantidad = distribucion[puntuacion] ?? 0;
                    const porcentaje = total
                        ? Math.round((cantidad / total) * 100)
                        : 0;

                    return (
                        <li
                            key={puntuacion}
                            className="flex items-center gap-2 text-xs text-text-muted"
                        >
                            <span className="w-10 shrink-0">
                                {puntuacion} ★
                            </span>

                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                                <span
                                    className="block h-full rounded-full bg-accent"
                                    style={{ width: `${porcentaje}%` }}
                                />
                            </span>

                            <span className="w-8 shrink-0 text-right">
                                {cantidad}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
