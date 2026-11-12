import { Link, useLocation } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { useEventos } from '../../features/notificaciones/useEventos.js';
import { formatearFechaHora, nombreCompleto } from '../../utils/formato.js';

// Accesos rápidos del panel.
const ACCESOS = [
    {
        destino: '/app/buscar',
        titulo: 'Buscar personas',
        descripcion: 'Encuentra usuarios por nombre, ciudad o habilidad.'
    },
    {
        destino: '/app/habilidades',
        titulo: 'Mis habilidades',
        descripcion: 'Publica lo que ofreces y lo que quieres aprender.'
    },
    {
        destino: '/app/conexiones',
        titulo: 'Mis conexiones',
        descripcion: 'Revisa tus intercambios activos y finalizados.'
    },
    {
        destino: '/app/mensajes',
        titulo: 'Mensajes',
        descripcion: 'Conversa con las personas con las que conectaste.'
    }
];

function TarjetaResumen({ titulo, total, detalle, destino, color }) {
    return (
        <Link
            to={destino}
            className="rounded-2xl border border-slate-800 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary"
        >
            <p className="text-sm font-medium text-text-muted">{titulo}</p>

            <p className={`mt-2 text-3xl font-bold ${color}`}>{total}</p>

            <p className="mt-1 text-xs text-text-muted">{detalle}</p>
        </Link>
    );
}

export default function InicioPage() {
    const { usuario } = useAuth();
    const { feed, errorFeed, recargarFeed } = useEventos();
    const ubicacion = useLocation();
    const aviso = ubicacion.state?.aviso ?? '';

    const { solicitudesPendientes, mensajesNoLeidos, pendientesDeCalificar } =
        feed;

    const hayActividad =
        solicitudesPendientes.items.length > 0 ||
        mensajesNoLeidos.porConexion.length > 0 ||
        pendientesDeCalificar.items.length > 0;

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">
                    Panel personal
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-main">
                    Hola, {usuario?.nombres ?? 'bienvenido'}
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Este es el resumen de tu actividad en SkillMatch. Los avisos
                    se actualizan en tiempo real.
                </p>
            </div>

            {aviso && (
                <div className="mb-6">
                    <AlertMessage type="info">{aviso}</AlertMessage>
                </div>
            )}

            {errorFeed && (
                <div className="mb-6">
                    <AlertMessage>
                        <p>{errorFeed}</p>

                        <button
                            type="button"
                            onClick={() => recargarFeed()}
                            className="mt-2 font-semibold underline"
                        >
                            Reintentar
                        </button>
                    </AlertMessage>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <TarjetaResumen
                    titulo="Solicitudes pendientes"
                    total={solicitudesPendientes.total}
                    detalle="Personas que quieren conectar contigo"
                    destino="/app/solicitudes"
                    color="text-accent"
                />

                <TarjetaResumen
                    titulo="Mensajes sin leer"
                    total={mensajesNoLeidos.total}
                    detalle="Conversaciones esperando respuesta"
                    destino="/app/mensajes"
                    color="text-primary"
                />

                <TarjetaResumen
                    titulo="Intercambios por calificar"
                    total={pendientesDeCalificar.total}
                    detalle="Conexiones finalizadas sin calificación"
                    destino="/app/calificaciones"
                    color="text-success"
                />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-800 bg-surface p-6 lg:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold text-text-main">
                            Actividad reciente
                        </h2>

                        {feed.actualizadoEn && (
                            <span className="text-xs text-text-muted">
                                Actualizado:{' '}
                                {formatearFechaHora(feed.actualizadoEn)}
                            </span>
                        )}
                    </div>

                    {!hayActividad ? (
                        <div className="mt-4">
                            <EstadoVacio titulo="No tienes novedades por ahora">
                                Cuando alguien te envíe una solicitud, un
                                mensaje o termine un intercambio, aparecerá aquí.
                            </EstadoVacio>
                        </div>
                    ) : (
                        <ul className="mt-4 space-y-3 text-sm">
                            {solicitudesPendientes.items.map((solicitud) => (
                                <li
                                    key={`solicitud-${solicitud.idSolicitud}`}
                                    className="rounded-xl border border-accent/30 bg-accent/5 p-3"
                                >
                                    <p className="font-medium text-text-main">
                                        {nombreCompleto(solicitud.emisor)} quiere
                                        conectar contigo.
                                    </p>

                                    {solicitud.mensajeInicial && (
                                        <p className="mt-1 text-text-muted">
                                            «{solicitud.mensajeInicial}»
                                        </p>
                                    )}

                                    <Link
                                        to="/app/solicitudes"
                                        className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
                                    >
                                        Responder solicitud
                                    </Link>
                                </li>
                            ))}

                            {mensajesNoLeidos.porConexion.map((item) => (
                                <li
                                    key={`mensaje-${item.idConexion}`}
                                    className="rounded-xl border border-primary/30 bg-primary/5 p-3"
                                >
                                    <p className="font-medium text-text-main">
                                        Tienes {item.total}{' '}
                                        {item.total === 1
                                            ? 'mensaje sin leer'
                                            : 'mensajes sin leer'}{' '}
                                        en una conversación.
                                    </p>

                                    <Link
                                        to={`/app/mensajes/${item.idConexion}`}
                                        className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                                    >
                                        Abrir conversación
                                    </Link>
                                </li>
                            ))}

                            {pendientesDeCalificar.items.map((item) => (
                                <li
                                    key={`calificar-${item.idConexion}`}
                                    className="rounded-xl border border-success/30 bg-success/5 p-3"
                                >
                                    <p className="font-medium text-text-main">
                                        Tu intercambio con{' '}
                                        {nombreCompleto(item.interlocutor)}{' '}
                                        terminó. Puedes calificarlo.
                                    </p>

                                    <Link
                                        to="/app/calificaciones"
                                        className="mt-2 inline-block text-xs font-semibold text-success hover:underline"
                                    >
                                        Calificar intercambio
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-text-main">
                        Accesos rápidos
                    </h2>

                    <div className="mt-3 grid gap-3">
                        {ACCESOS.map((acceso) => (
                            <Link
                                key={acceso.destino}
                                to={acceso.destino}
                                className="rounded-xl border border-slate-800 bg-surface p-4 transition hover:border-primary"
                            >
                                <p className="font-medium text-text-main">
                                    {acceso.titulo}
                                </p>

                                <p className="mt-1 text-xs text-text-muted">
                                    {acceso.descripcion}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
}
