import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useEventos } from '../useEventos.js';
import { formatearFechaHora, nombreCompleto } from '../../../utils/formato.js';

/**
 * Campana con el resumen de notificaciones.
 * El panel se alimenta del feed que mantiene EventosProvider (SSE + sondeo).
 */
export default function PanelNotificaciones() {
    const { feed, errorFeed, recargarFeed } = useEventos();
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);

    useEffect(() => {
        if (!abierto) {
            return undefined;
        }

        function alPresionarFuera(evento) {
            if (
                contenedorRef.current &&
                !contenedorRef.current.contains(evento.target)
            ) {
                setAbierto(false);
            }
        }

        function alPulsarTecla(evento) {
            if (evento.key === 'Escape') {
                setAbierto(false);
            }
        }

        document.addEventListener('mousedown', alPresionarFuera);
        document.addEventListener('keydown', alPulsarTecla);

        return () => {
            document.removeEventListener('mousedown', alPresionarFuera);
            document.removeEventListener('keydown', alPulsarTecla);
        };
    }, [abierto]);

    const { solicitudesPendientes, mensajesNoLeidos, pendientesDeCalificar } =
        feed;

    const total = feed.total;

    return (
        <div ref={contenedorRef} className="relative">
            <button
                type="button"
                onClick={() => setAbierto((valor) => !valor)}
                aria-expanded={abierto}
                aria-haspopup="dialog"
                className="relative rounded-lg border border-slate-700 p-2 text-text-muted transition hover:border-primary hover:text-primary"
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.86 17.24a3 3 0 0 1-5.72 0M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"
                    />
                </svg>

                <span className="sr-only">Notificaciones</span>

                {total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
                        {total > 99 ? '99+' : total}
                    </span>
                )}
            </button>

            {abierto && (
                <div
                    role="dialog"
                    aria-label="Notificaciones"
                    className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-surface p-4 shadow-2xl"
                >
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-text-main">
                            Notificaciones
                        </h2>

                        <button
                            type="button"
                            onClick={() => recargarFeed()}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Actualizar
                        </button>
                    </div>

                    {feed.actualizadoEn && (
                        <p className="mt-1 text-xs text-text-muted">
                            Al día: {formatearFechaHora(feed.actualizadoEn)}
                        </p>
                    )}

                    {errorFeed && (
                        <p role="alert" className="mt-2 text-xs text-danger">
                            {errorFeed}
                        </p>
                    )}

                    <section className="mt-3 border-t border-slate-800 pt-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Solicitudes ({solicitudesPendientes.total})
                        </h3>

                        {solicitudesPendientes.items.length === 0 ? (
                            <p className="mt-1 text-xs text-text-muted">
                                Sin solicitudes pendientes.
                            </p>
                        ) : (
                            <ul className="mt-1 space-y-1">
                                {solicitudesPendientes.items
                                    .slice(0, 3)
                                    .map((solicitud) => (
                                        <li key={solicitud.idSolicitud}>
                                            <Link
                                                to="/app/solicitudes"
                                                onClick={() => setAbierto(false)}
                                                className="block rounded-lg px-2 py-1 text-sm text-text-main hover:bg-slate-800"
                                            >
                                                {nombreCompleto(
                                                    solicitud.emisor
                                                )}{' '}
                                                quiere conectar contigo.
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </section>

                    <section className="mt-3 border-t border-slate-800 pt-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Mensajes sin leer ({mensajesNoLeidos.total})
                        </h3>

                        {mensajesNoLeidos.porConexion.length === 0 ? (
                            <p className="mt-1 text-xs text-text-muted">
                                No tienes mensajes pendientes.
                            </p>
                        ) : (
                            <ul className="mt-1 space-y-1">
                                {mensajesNoLeidos.porConexion
                                    .slice(0, 3)
                                    .map((item) => (
                                        <li key={item.idConexion}>
                                            <Link
                                                to={`/app/mensajes/${item.idConexion}`}
                                                onClick={() => setAbierto(false)}
                                                className="block rounded-lg px-2 py-1 text-sm text-text-main hover:bg-slate-800"
                                            >
                                                Conversación #{item.idConexion}:{' '}
                                                {item.total} sin leer.
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </section>

                    <section className="mt-3 border-t border-slate-800 pt-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Por calificar ({pendientesDeCalificar.total})
                        </h3>

                        {pendientesDeCalificar.items.length === 0 ? (
                            <p className="mt-1 text-xs text-text-muted">
                                No tienes intercambios por calificar.
                            </p>
                        ) : (
                            <ul className="mt-1 space-y-1">
                                {pendientesDeCalificar.items
                                    .slice(0, 3)
                                    .map((item) => (
                                        <li key={item.idConexion}>
                                            <Link
                                                to="/app/calificaciones"
                                                onClick={() => setAbierto(false)}
                                                className="block rounded-lg px-2 py-1 text-sm text-text-main hover:bg-slate-800"
                                            >
                                                Califica tu intercambio con{' '}
                                                {nombreCompleto(
                                                    item.interlocutor
                                                )}
                                                .
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
