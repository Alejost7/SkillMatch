import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import CampoSelect from '../../components/CampoSelect.jsx';
import Cargando from '../../components/Cargando.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { useEventos } from '../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../utils/errores.js';

import SolicitudTarjeta from './components/SolicitudTarjeta.jsx';

import {
    aceptarSolicitud,
    cancelarSolicitud,
    listarEnviadas,
    listarRecibidas,
    rechazarSolicitud
} from './solicitudes.api.js';

const PESTANAS = [
    { valor: 'recibidas', texto: 'Recibidas' },
    { valor: 'enviadas', texto: 'Enviadas' }
];

const OPCIONES_ESTADO = [
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'aceptada', etiqueta: 'Aceptadas' },
    { valor: 'rechazada', etiqueta: 'Rechazadas' },
    { valor: 'cancelada', etiqueta: 'Canceladas' }
];

const TAMANO_PAGINA = 8;

export default function SolicitudesPage() {
    const { recargarFeed } = useEventos();

    const [pestana, setPestana] = useState('recibidas');
    const [estado, setEstado] = useState('');
    const [pagina, setPagina] = useState(1);

    const [datos, setDatos] = useState({ solicitudes: [], paginacion: null });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [procesando, setProcesando] = useState(null);
    const [recarga, setRecarga] = useState(0);

    // Listado según la pestaña, el estado y la página.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarSolicitudes() {
            try {
                const filtros = {
                    estado,
                    page: pagina,
                    limit: TAMANO_PAGINA
                };

                const resultado =
                    pestana === 'recibidas'
                        ? await listarRecibidas(filtros, {
                              signal: controlador.signal
                          })
                        : await listarEnviadas(filtros, {
                              signal: controlador.signal
                          });

                if (!controlador.signal.aborted) {
                    setDatos(resultado);
                    setError('');
                }
            } catch (errorCarga) {
                if (!controlador.signal.aborted) {
                    setError(mensajeDeError(errorCarga));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarSolicitudes();

        return () => controlador.abort();
    }, [pestana, estado, pagina, recarga]);

    function recargarListado() {
        setCargando(true);
        setRecarga((actual) => actual + 1);
    }

    function cambiarPestana(valor) {
        if (valor === pestana) return;

        setCargando(true);
        setMensaje(null);
        setPestana(valor);
        setPagina(1);
    }

    function cambiarEstado(evento) {
        setCargando(true);
        setMensaje(null);
        setEstado(evento.target.value);
        setPagina(1);
    }

    function cambiarPagina(destino) {
        setCargando(true);
        setPagina(destino);
    }

    async function aceptar(solicitud) {
        if (procesando) return;

        setProcesando(solicitud.idSolicitud);
        setMensaje(null);

        try {
            const resultado = await aceptarSolicitud(solicitud.idSolicitud);

            setMensaje({
                type: 'success',
                text: 'Solicitud aceptada. Ya puedes conversar con esta persona.',
                conexionId: resultado?.conexion?.idConexion ?? null
            });

            recargarListado();
            void recargarFeed();
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error)
            });
        } finally {
            setProcesando(null);
        }
    }

    async function rechazar(solicitud) {
        if (procesando) return;

        setProcesando(solicitud.idSolicitud);
        setMensaje(null);

        try {
            await rechazarSolicitud(solicitud.idSolicitud);

            setMensaje({
                type: 'success',
                text: 'Solicitud rechazada.'
            });

            recargarListado();
            void recargarFeed();
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error)
            });
        } finally {
            setProcesando(null);
        }
    }

    async function cancelar(solicitud) {
        if (procesando) return;

        setProcesando(solicitud.idSolicitud);
        setMensaje(null);

        try {
            await cancelarSolicitud(solicitud.idSolicitud);

            setMensaje({
                type: 'success',
                text: 'Solicitud cancelada.'
            });

            recargarListado();
            void recargarFeed();
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error)
            });
        } finally {
            setProcesando(null);
        }
    }

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Conexiones</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Solicitudes
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Responde las solicitudes que recibiste o revisa el estado de
                    las que enviaste.
                </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div
                    role="tablist"
                    aria-label="Tipo de solicitudes"
                    className="flex gap-2 rounded-xl border border-slate-800 bg-surface p-1"
                >
                    {PESTANAS.map((opcion) => (
                        <button
                            key={opcion.valor}
                            type="button"
                            role="tab"
                            aria-selected={pestana === opcion.valor}
                            onClick={() => cambiarPestana(opcion.valor)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                pestana === opcion.valor
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-text-muted hover:bg-slate-800 hover:text-text-main'
                            }`}
                        >
                            {opcion.texto}
                        </button>
                    ))}
                </div>

                <div className="w-full sm:w-56">
                    <CampoSelect
                        id="filtro-estado-solicitudes"
                        label="Estado"
                        value={estado}
                        onChange={cambiarEstado}
                        placeholder="Todos"
                        opciones={OPCIONES_ESTADO}
                    />
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {mensaje && (
                    <AlertMessage type={mensaje.type}>
                        <p>{mensaje.text}</p>

                        {mensaje.conexionId && (
                            <Link
                                to={`/app/mensajes/${mensaje.conexionId}`}
                                className="mt-2 inline-block font-semibold underline"
                            >
                                Abrir la conversación
                            </Link>
                        )}
                    </AlertMessage>
                )}

                {error && <AlertMessage>{error}</AlertMessage>}
            </div>

            <div className="mt-6">
                {cargando ? (
                    <Cargando mensaje="Cargando solicitudes…" />
                ) : datos.solicitudes.length === 0 ? (
                    <EstadoVacio
                        titulo={
                            pestana === 'recibidas'
                                ? 'No tienes solicitudes recibidas'
                                : 'No has enviado solicitudes'
                        }
                    >
                        {pestana === 'recibidas'
                            ? 'Cuando alguien quiera conectar contigo, aparecerá aquí.'
                            : 'Encuentra personas en el buscador y envíales una solicitud.'}
                    </EstadoVacio>
                ) : (
                    <ul className="space-y-3">
                        {datos.solicitudes.map((solicitud) => (
                            <li key={solicitud.idSolicitud}>
                                <SolicitudTarjeta
                                    solicitud={solicitud}
                                    tipo={
                                        pestana === 'recibidas'
                                            ? 'recibida'
                                            : 'enviada'
                                    }
                                    onAceptar={aceptar}
                                    onRechazar={rechazar}
                                    onCancelar={cancelar}
                                    ocupado={procesando !== null}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                <Paginacion
                    paginacion={datos.paginacion}
                    onAnterior={() => cambiarPagina(pagina - 1)}
                    onSiguiente={() => cambiarPagina(pagina + 1)}
                    deshabilitado={cargando || procesando !== null}
                />
            </div>
        </section>
    );
}
