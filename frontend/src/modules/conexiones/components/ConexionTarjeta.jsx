import { Link } from 'react-router-dom';

import {
    etiquetaEstado,
    formatearFecha,
    iniciales,
    nombreCompleto
} from '../../../utils/formato.js';

const ESTILOS_ESTADO = {
    activa: 'bg-success/15 text-success',
    finalizada: 'bg-primary/15 text-primary',
    bloqueada: 'bg-danger/15 text-danger'
};

/**
 * Tarjeta de una conexión vista desde el usuario autenticado.
 */
export default function ConexionTarjeta({ conexion, onFinalizar, ocupado = false }) {
    const interlocutor = conexion.interlocutor;
    const activa = conexion.estado === 'activa';

    return (
        <article className="rounded-2xl border border-slate-800 bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {iniciales(interlocutor)}
                    </span>

                    <div className="min-w-0">
                        <h2 className="truncate font-semibold text-text-main">
                            {nombreCompleto(interlocutor)}
                        </h2>

                        <p className="text-xs text-text-muted">
                            {interlocutor.alias
                                ? `@${interlocutor.alias}`
                                : 'Sin alias'}
                            {' · '}
                            Desde {formatearFecha(conexion.fechaInicio)}
                        </p>

                        {conexion.noLeidos > 0 && (
                            <p className="mt-1 text-xs font-semibold text-accent">
                                {conexion.noLeidos}{' '}
                                {conexion.noLeidos === 1
                                    ? 'mensaje sin leer'
                                    : 'mensajes sin leer'}
                            </p>
                        )}
                    </div>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ESTILOS_ESTADO[conexion.estado] ??
                        'bg-slate-700/40 text-text-muted'
                    }`}
                >
                    {etiquetaEstado(conexion.estado)}
                </span>
            </div>

            {conexion.mensajeInicial && (
                <p className="mt-3 rounded-xl bg-surface-alt p-3 text-sm text-text-main">
                    «{conexion.mensajeInicial}»
                </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                    to={`/app/mensajes/${conexion.idConexion}`}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
                >
                    {conexion.noLeidos > 0 ? 'Leer mensajes' : 'Abrir chat'}
                </Link>

                {activa && (
                    <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => onFinalizar(conexion)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:border-danger hover:text-danger disabled:opacity-50"
                    >
                        Finalizar intercambio
                    </button>
                )}

                {conexion.estado === 'finalizada' && (
                    <Link
                        to="/app/calificaciones"
                        className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/10"
                    >
                        Calificar
                    </Link>
                )}

                <Link
                    to={`/app/usuarios/${interlocutor.idUsuario}`}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                >
                    Ver perfil
                </Link>
            </div>
        </article>
    );
}
