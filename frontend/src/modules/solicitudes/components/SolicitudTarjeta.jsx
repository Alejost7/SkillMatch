import { Link } from 'react-router-dom';

import {
    etiquetaEstado,
    formatearFecha,
    nombreCompleto
} from '../../../utils/formato.js';

const ESTILOS_ESTADO = {
    pendiente: 'bg-accent/15 text-accent',
    aceptada: 'bg-success/15 text-success',
    rechazada: 'bg-danger/15 text-danger',
    cancelada: 'bg-slate-700/40 text-text-muted'
};

/**
 * Tarjeta de una solicitud de conexión.
 * tipo: "recibida" (la envió otra persona) o "enviada".
 */
export default function SolicitudTarjeta({
    solicitud,
    tipo,
    onAceptar,
    onRechazar,
    onCancelar,
    ocupado = false
}) {
    const interlocutor =
        tipo === 'recibida' ? solicitud.emisor : solicitud.receptor;

    const pendiente = solicitud.estado === 'pendiente';

    return (
        <article className="rounded-2xl border border-slate-800 bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-semibold text-text-main">
                        {nombreCompleto(interlocutor)}
                    </h2>

                    <p className="text-xs text-text-muted">
                        {interlocutor.alias ? `@${interlocutor.alias}` : 'Sin alias'}
                        {' · '}
                        {tipo === 'recibida'
                            ? 'quiere conectar contigo'
                            : 'espera tu solicitud'}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Enviada el {formatearFecha(solicitud.fechaEnvio)}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ESTILOS_ESTADO[solicitud.estado] ??
                        ESTILOS_ESTADO.cancelada
                    }`}
                >
                    {etiquetaEstado(solicitud.estado)}
                </span>
            </div>

            {solicitud.mensajeInicial && (
                <p className="mt-3 rounded-xl bg-surface-alt p-3 text-sm text-text-main">
                    «{solicitud.mensajeInicial}»
                </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {tipo === 'recibida' && pendiente && (
                    <>
                        <button
                            type="button"
                            disabled={ocupado}
                            onClick={() => onAceptar(solicitud)}
                            className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-success/90 disabled:opacity-50"
                        >
                            Aceptar
                        </button>

                        <button
                            type="button"
                            disabled={ocupado}
                            onClick={() => onRechazar(solicitud)}
                            className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
                        >
                            Rechazar
                        </button>
                    </>
                )}

                {tipo === 'enviada' && pendiente && (
                    <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => onCancelar(solicitud)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:border-danger hover:text-danger disabled:opacity-50"
                    >
                        Cancelar solicitud
                    </button>
                )}

                {solicitud.estado === 'aceptada' && (
                    <Link
                        to="/app/conexiones"
                        className="rounded-lg border border-success px-4 py-2 text-sm font-medium text-success transition hover:bg-success/10"
                    >
                        Ver conexión
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
