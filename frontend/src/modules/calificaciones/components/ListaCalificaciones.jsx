import EstadoVacio from '../../../components/EstadoVacio.jsx';
import { formatearFecha, nombreCompleto } from '../../../utils/formato.js';
import { ETIQUETAS_PUNTUACION } from '../calificaciones.validation.js';

/**
 * Listado de calificaciones recibidas.
 * Cada tarjeta muestra quién calificó, la puntuación y el comentario.
 */
export default function ListaCalificaciones({
    calificaciones = [],
    vacio = 'Todavía no hay calificaciones para mostrar.'
}) {
    if (calificaciones.length === 0) {
        return <EstadoVacio titulo={vacio} />;
    }

    return (
        <ul className="space-y-3">
            {calificaciones.map((calificacion) => (
                <li
                    key={calificacion.idCalificacion}
                    className="rounded-2xl border border-slate-800 bg-surface p-4"
                >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-medium text-text-main">
                                {nombreCompleto(calificacion.calificador)}
                            </p>

                            <p className="text-xs text-text-muted">
                                {formatearFecha(calificacion.fechaCalificacion)}
                                {calificacion.esPropia && ' · Escrita por ti'}
                            </p>
                        </div>

                        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                            {calificacion.puntuacion} ★ ·{' '}
                            {ETIQUETAS_PUNTUACION[calificacion.puntuacion] ??
                                'Sin etiqueta'}
                        </span>
                    </div>

                    {calificacion.comentario && (
                        <p className="mt-3 text-sm text-text-main">
                            «{calificacion.comentario}»
                        </p>
                    )}
                </li>
            ))}
        </ul>
    );
}
