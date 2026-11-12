import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import CampoSelect from '../../components/CampoSelect.jsx';
import Cargando from '../../components/Cargando.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { useEventos } from '../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../utils/errores.js';
import { nombreCompleto } from '../../utils/formato.js';

import ConexionTarjeta from './components/ConexionTarjeta.jsx';
import { finalizarConexion, listarConexiones } from './conexiones.api.js';

const OPCIONES_ESTADO = [
    { valor: 'activa', etiqueta: 'Activas' },
    { valor: 'finalizada', etiqueta: 'Finalizadas' },
    { valor: 'bloqueada', etiqueta: 'Bloqueadas' }
];

const TAMANO_PAGINA = 8;

export default function ConexionesPage() {
    const { recargarFeed } = useEventos();

    const [estado, setEstado] = useState('');
    const [pagina, setPagina] = useState(1);

    const [datos, setDatos] = useState({ conexiones: [], paginacion: null });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [recarga, setRecarga] = useState(0);

    const [conexionFinalizar, setConexionFinalizar] = useState(null);
    const [finalizando, setFinalizando] = useState(false);
    const [errorFinalizar, setErrorFinalizar] = useState('');

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarConexiones() {
            try {
                const resultado = await listarConexiones(
                    { estado, page: pagina, limit: TAMANO_PAGINA },
                    { signal: controlador.signal }
                );

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

        cargarConexiones();

        return () => controlador.abort();
    }, [estado, pagina, recarga]);

    function recargarListado() {
        setCargando(true);
        setRecarga((actual) => actual + 1);
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

    function solicitarFinalizacion(conexion) {
        if (finalizando) return;

        setErrorFinalizar('');
        setMensaje(null);
        setConexionFinalizar(conexion);
    }

    function cancelarFinalizacion() {
        if (finalizando) return;

        setConexionFinalizar(null);
        setErrorFinalizar('');
    }

    async function confirmarFinalizacion() {
        if (!conexionFinalizar || finalizando) return;

        setFinalizando(true);
        setErrorFinalizar('');

        try {
            await finalizarConexion(conexionFinalizar.idConexion);

            setConexionFinalizar(null);
            recargarListado();
            void recargarFeed();

            setMensaje({
                type: 'success',
                text: 'Intercambio finalizado. Ya puedes calificar a la otra persona.'
            });
        } catch (errorFinalizo) {
            setErrorFinalizar(mensajeDeError(errorFinalizo));
        } finally {
            setFinalizando(false);
        }
    }

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Conexiones</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Mis conexiones
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Aquí están los intercambios aceptados. Mientras la conexión
                    esté activa puedes conversar; al finalizarla puedes calificar
                    a la otra persona.
                </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="w-full sm:w-56">
                    <CampoSelect
                        id="filtro-estado-conexiones"
                        label="Estado"
                        value={estado}
                        onChange={cambiarEstado}
                        placeholder="Todas"
                        opciones={OPCIONES_ESTADO}
                    />
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {mensaje && (
                    <AlertMessage type={mensaje.type}>
                        {mensaje.text}
                    </AlertMessage>
                )}

                {error && <AlertMessage>{error}</AlertMessage>}
            </div>

            <div className="mt-6">
                {cargando ? (
                    <Cargando mensaje="Cargando conexiones…" />
                ) : datos.conexiones.length === 0 ? (
                    <EstadoVacio titulo="No tienes conexiones en este estado">
                        Cuando aceptes una solicitud de conexión, el intercambio
                        aparecerá aquí.
                    </EstadoVacio>
                ) : (
                    <ul className="space-y-3">
                        {datos.conexiones.map((conexion) => (
                            <li key={conexion.idConexion}>
                                <ConexionTarjeta
                                    conexion={conexion}
                                    onFinalizar={solicitarFinalizacion}
                                    ocupado={finalizando}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                <Paginacion
                    paginacion={datos.paginacion}
                    onAnterior={() => cambiarPagina(pagina - 1)}
                    onSiguiente={() => cambiarPagina(pagina + 1)}
                    deshabilitado={cargando || finalizando}
                />
            </div>

            {conexionFinalizar && (
                <ConfirmDialog
                    titulo="Finalizar intercambio"
                    descripcion={`¿Deseas finalizar tu intercambio con ${nombreCompleto(conexionFinalizar.interlocutor)}? Después ya no podrán enviarse mensajes en esta conversación.`}
                    textoConfirmar="Sí, finalizar"
                    textoOcupado="Finalizando…"
                    peligro={false}
                    ocupado={finalizando}
                    error={errorFinalizar}
                    onCancel={cancelarFinalizacion}
                    onConfirm={confirmarFinalizacion}
                />
            )}
        </section>
    );
}
