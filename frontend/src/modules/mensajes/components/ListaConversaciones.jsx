import { Link } from 'react-router-dom';

import {
    etiquetaEstado,
    formatearFecha,
    iniciales,
    nombreCompleto
} from '../../../utils/formato.js';

/**
 * Lista de conversaciones disponibles (una por conexión).
 */
export default function ListaConversaciones({ conexiones = [] }) {
    return (
        <ul className="space-y-3">
            {conexiones.map((conexion) => (
                <li key={conexion.idConexion}>
                    <Link
                        to={`/app/mensajes/${conexion.idConexion}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-surface p-4 transition hover:border-primary"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                                {iniciales(conexion.interlocutor)}
                            </span>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-text-main">
                                    {nombreCompleto(conexion.interlocutor)}
                                </p>

                                <p className="truncate text-xs text-text-muted">
                                    {etiquetaEstado(conexion.estado)} · desde{' '}
                                    {formatearFecha(conexion.fechaInicio)}
                                </p>
                            </div>
                        </div>

                        {conexion.noLeidos > 0 ? (
                            <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-slate-950">
                                {conexion.noLeidos}
                            </span>
                        ) : (
                            <span className="shrink-0 text-xs text-text-muted">
                                Abrir
                            </span>
                        )}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
