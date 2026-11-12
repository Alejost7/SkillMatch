import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import { useEventos } from '../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../utils/errores.js';
import {
    etiquetaEstado,
    iniciales,
    nombreCompleto
} from '../../utils/formato.js';

import { obtenerConexion } from '../conexiones/conexiones.api.js';

import BurbujaMensaje from './components/BurbujaMensaje.jsx';
import FormularioMensaje from './components/FormularioMensaje.jsx';
import { enviarMensaje, listarMensajes, marcarLeidos } from './mensajes.api.js';
import { fusionarMensajes, ultimoIdMensaje } from './mensajes.utils.js';

const MENSAJES_POR_PAGINA = 30;

// Sondeo delta de respaldo: si el flujo SSE se cae, el chat igual se actualiza.
const INTERVALO_SONDEO_MS = 20000;

export default function ChatPage() {
    const { idConexion } = useParams();
    const conexionId = Number(idConexion);

    const { recargarFeed, suscribirMensaje, suscribirFeed } = useEventos();

    const [conexion, setConexion] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [paginacion, setPaginacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [errorAccion, setErrorAccion] = useState('');
    const [cargandoAnteriores, setCargandoAnteriores] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const mensajesRef = useRef([]);
    const finRef = useRef(null);

    // Copia de los mensajes para el sondeo sin provocar efectos adicionales.
    useEffect(() => {
        mensajesRef.current = mensajes;
    }, [mensajes]);

    // Carga inicial: datos de la conexión y la última página de mensajes.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarConversacion() {
            try {
                const [datosConexion, primera] = await Promise.all([
                    obtenerConexion(conexionId, {
                        signal: controlador.signal
                    }),
                    listarMensajes(
                        {
                            conexionId,
                            page: 1,
                            limit: MENSAJES_POR_PAGINA
                        },
                        { signal: controlador.signal }
                    )
                ]);

                const totalPaginas = primera.paginacion?.totalPaginas ?? 1;

                // El chat abre en los mensajes más recientes.
                let paginaFinal = primera;

                if (totalPaginas > 1) {
                    paginaFinal = await listarMensajes(
                        {
                            conexionId,
                            page: totalPaginas,
                            limit: MENSAJES_POR_PAGINA
                        },
                        { signal: controlador.signal }
                    );
                }

                if (controlador.signal.aborted) {
                    return;
                }

                setConexion(datosConexion);
                setMensajes(paginaFinal.mensajes);
                setPaginacion(paginaFinal.paginacion);
                setErrorCarga('');
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCarga(mensajeDeError(error));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarConversacion();

        return () => controlador.abort();
    }, [conexionId]);

    // Al abrir la conversación se marcan como leídos los mensajes recibidos.
    useEffect(() => {
        if (cargando || !conexion) {
            return undefined;
        }

        let activo = true;

        async function marcar() {
            try {
                await marcarLeidos(conexionId);

                if (activo) {
                    void recargarFeed();
                }
            } catch {
                // Si falla, el feed conservará el contador anterior; el usuario
                // puede reintentar recargando la página.
            }
        }

        void marcar();

        return () => {
            activo = false;
        };
    }, [cargando, conexion, conexionId, recargarFeed]);

    // Sondeo delta: pide solo los mensajes posteriores al último conocido.
    const actualizarDelta = useCallback(async () => {
        const desde = ultimoIdMensaje(mensajesRef.current);

        if (!desde) {
            return;
        }

        try {
            const resultado = await listarMensajes({ conexionId, desde });

            if (resultado.mensajes.length > 0) {
                setMensajes((actuales) =>
                    fusionarMensajes(actuales, resultado.mensajes)
                );
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setErrorAccion(mensajeDeError(error));
            }
        }
    }, [conexionId]);

    // Mensajes en vivo del flujo SSE.
    useEffect(() => {
        const desuscribir = suscribirMensaje((mensajeNuevo) => {
            if (mensajeNuevo?.idConexion !== conexionId) {
                return;
            }

            setMensajes((actuales) =>
                fusionarMensajes(actuales, [mensajeNuevo])
            );

            if (!mensajeNuevo.esPropio) {
                void marcarLeidos(conexionId)
                    .then(() => recargarFeed())
                    .catch(() => {});
            }
        });

        return desuscribir;
    }, [conexionId, recargarFeed, suscribirMensaje]);

    // Avisos de "feed" con motivo mensaje: completa lo que el SSE no entregó.
    useEffect(() => {
        const desuscribir = suscribirFeed(({ motivo, idConexion: afectada }) => {
            if (motivo !== 'mensaje') {
                return;
            }

            if (afectada && afectada !== conexionId) {
                return;
            }

            void actualizarDelta();
        });

        return desuscribir;
    }, [conexionId, actualizarDelta, suscribirFeed]);

    // Respaldo periódico por si el SSE está caído.
    useEffect(() => {
        const intervalo = setInterval(() => {
            void actualizarDelta();
        }, INTERVALO_SONDEO_MS);

        return () => clearInterval(intervalo);
    }, [actualizarDelta]);

    // Desplaza la vista al último mensaje.
    useEffect(() => {
        finRef.current?.scrollIntoView({ block: 'end' });
    }, [mensajes]);

    async function enviar(contenido) {
        setEnviando(true);
        setErrorAccion('');

        try {
            const mensaje = await enviarMensaje({
                idConexion: conexionId,
                contenido
            });

            setMensajes((actuales) => fusionarMensajes(actuales, [mensaje]));
            void recargarFeed();

            return true;
        } catch (error) {
            setErrorAccion(mensajeDeError(error));
            return false;
        } finally {
            setEnviando(false);
        }
    }

    async function cargarAnteriores() {
        if (!paginacion || paginacion.pagina <= 1 || cargandoAnteriores) {
            return;
        }

        setCargandoAnteriores(true);
        setErrorAccion('');

        try {
            const anterior = await listarMensajes({
                conexionId,
                page: paginacion.pagina - 1,
                limit: MENSAJES_POR_PAGINA
            });

            setMensajes((actuales) =>
                fusionarMensajes(anterior.mensajes, actuales)
            );
            setPaginacion(anterior.paginacion);
        } catch (error) {
            setErrorAccion(mensajeDeError(error));
        } finally {
            setCargandoAnteriores(false);
        }
    }

    if (cargando) {
        return <Cargando mensaje="Abriendo la conversación…" />;
    }

    if (errorCarga) {
        return (
            <div className="space-y-4">
                <AlertMessage>{errorCarga}</AlertMessage>

                <Link
                    to="/app/mensajes"
                    className="inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                >
                    Volver a mensajes
                </Link>
            </div>
        );
    }

    const activa = conexion?.estado === 'activa';

    return (
        <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {iniciales(conexion.interlocutor)}
                    </span>

                    <div className="min-w-0">
                        <h1 className="truncate font-semibold text-text-main">
                            {nombreCompleto(conexion.interlocutor)}
                        </h1>

                        <p className="text-xs text-text-muted">
                            {conexion.interlocutor.alias
                                ? `@${conexion.interlocutor.alias}`
                                : 'Sin alias'}
                            {' · '}
                            {etiquetaEstado(conexion.estado)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        to={`/app/usuarios/${conexion.interlocutor.idUsuario}`}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                    >
                        Ver perfil
                    </Link>

                    <Link
                        to="/app/mensajes"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            {errorAccion && (
                <div className="mb-3">
                    <AlertMessage>{errorAccion}</AlertMessage>
                </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-background">
                <div className="max-h-[60vh] min-h-[45vh] space-y-3 overflow-y-auto p-4">
                    {paginacion?.pagina > 1 && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={cargarAnteriores}
                                disabled={cargandoAnteriores}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-text-main transition hover:bg-slate-800 disabled:opacity-60"
                            >
                                {cargandoAnteriores
                                    ? 'Cargando…'
                                    : 'Ver mensajes anteriores'}
                            </button>
                        </div>
                    )}

                    {mensajes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-text-muted">
                            Todavía no hay mensajes. ¡Escribe el primero!
                        </p>
                    ) : (
                        mensajes.map((mensaje) => (
                            <BurbujaMensaje
                                key={mensaje.idMensaje}
                                mensaje={mensaje}
                            />
                        ))
                    )}

                    <div ref={finRef} />
                </div>
            </div>

            {activa ? (
                <FormularioMensaje
                    onEnviar={enviar}
                    enviando={enviando}
                    deshabilitado={!activa}
                />
            ) : (
                <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
                    Este intercambio está{' '}
                    {etiquetaEstado(conexion?.estado).toLowerCase()} y ya no
                    admite mensajes nuevos. Puedes calificar a la otra persona
                    desde la sección de calificaciones.
                </p>
            )}
        </section>
    );
}
