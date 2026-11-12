import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { useEventos } from '../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../utils/errores.js';

import FormularioCalificacion from './components/FormularioCalificacion.jsx';
import ListaCalificaciones from './components/ListaCalificaciones.jsx';
import ResumenCalificaciones from './components/ResumenCalificaciones.jsx';
import { listarCalificacionesUsuario } from './calificaciones.api.js';

const CALIFICACIONES_POR_PAGINA = 5;

export default function CalificacionesPage() {
    const { usuario } = useAuth();
    const { feed, recargarFeed } = useEventos();

    const idUsuario = usuario?.idUsuario;

    const [recibidas, setRecibidas] = useState({
        lista: [],
        resumen: null,
        paginacion: null
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [recarga, setRecarga] = useState(0);

    const pendientes = feed.pendientesDeCalificar;

    // Calificaciones recibidas por el usuario autenticado.
    useEffect(() => {
        if (!idUsuario) {
            return undefined;
        }

        const controlador = new AbortController();

        async function cargarCalificaciones() {
            try {
                const resultado = await listarCalificacionesUsuario(
                    idUsuario,
                    { page: pagina, limit: CALIFICACIONES_POR_PAGINA },
                    { signal: controlador.signal }
                );

                if (!controlador.signal.aborted) {
                    setRecibidas({
                        lista: resultado.calificaciones,
                        resumen: resultado.resumen,
                        paginacion: resultado.paginacion
                    });
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

        cargarCalificaciones();

        return () => controlador.abort();
    }, [idUsuario, pagina, recarga]);

    function trasCalificar() {
        setMensaje({
            type: 'success',
            text: 'Calificación registrada. ¡Gracias por tu opinión!'
        });

        setCargando(true);
        setRecarga((actual) => actual + 1);
        void recargarFeed();
    }

    function cambiarPagina(destino) {
        setCargando(true);
        setPagina(destino);
    }

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Reputación</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Calificaciones
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Califica los intercambios finalizados y revisa la reputación
                    que construiste en la comunidad.
                </p>
            </div>

            {mensaje && (
                <div className="mb-6">
                    <AlertMessage type={mensaje.type}>
                        {mensaje.text}
                    </AlertMessage>
                </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="mb-3 text-lg font-semibold text-text-main">
                        Intercambios por calificar
                    </h2>

                    {pendientes.total === 0 ? (
                        <EstadoVacio titulo="No tienes intercambios pendientes">
                            Cuando finalices una conexión podrás calificar a la
                            otra persona desde aquí.
                        </EstadoVacio>
                    ) : (
                        <div className="space-y-4">
                            {pendientes.items.map((item) => (
                                <FormularioCalificacion
                                    key={item.idConexion}
                                    idConexion={item.idConexion}
                                    interlocutor={item.interlocutor}
                                    onCalificada={trasCalificar}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <aside>
                    <h2 className="mb-3 text-lg font-semibold text-text-main">
                        Mi reputación
                    </h2>

                    <ResumenCalificaciones resumen={recibidas.resumen} />
                </aside>
            </div>

            <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-text-main">
                    Calificaciones recibidas
                </h2>

                {error && (
                    <div className="mb-3">
                        <AlertMessage>{error}</AlertMessage>
                    </div>
                )}

                {cargando ? (
                    <Cargando mensaje="Cargando calificaciones…" />
                ) : (
                    <>
                        <ListaCalificaciones
                            calificaciones={recibidas.lista}
                            vacio="Todavía no has recibido calificaciones."
                        />

                        <Paginacion
                            paginacion={recibidas.paginacion}
                            onAnterior={() => cambiarPagina(pagina - 1)}
                            onSiguiente={() => cambiarPagina(pagina + 1)}
                            deshabilitado={cargando}
                        />
                    </>
                )}
            </section>
        </section>
    );
}
