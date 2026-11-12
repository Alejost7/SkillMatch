import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { useAuth } from '../auth/useAuth.js';
import { EventosContext } from './eventosContexto.js';
import { suscribirEventos } from '../../services/eventosCliente.js';
import { mensajeDeError } from '../../utils/errores.js';
import { nombreCompleto } from '../../utils/formato.js';
import { obtenerFeed } from './notificaciones.api.js';

// Forma del feed mientras llega la primera respuesta del backend.
const FEED_INICIAL = {
    actualizadoEn: null,
    total: 0,
    solicitudesPendientes: { total: 0, items: [] },
    mensajesNoLeidos: { total: 0, porConexion: [] },
    pendientesDeCalificar: { total: 0, items: [] }
};

// Los eventos llegan en ráfaga (varios "feed" seguidos). Se agrupa la recarga
// del resumen para hacer una sola consulta.
const RETRASO_REFRESCO_MS = 1000;

// Máximo de avisos flotantes simultáneos.
const MAXIMO_AVISOS = 4;

export function EventosProvider({ children }) {
    const { autenticado } = useAuth();

    const [feed, setFeed] = useState(FEED_INICIAL);
    const [errorFeed, setErrorFeed] = useState('');
    const [modoConexion, setModoConexion] = useState('desconectado');
    const [avisos, setAvisos] = useState([]);

    // Controladores y temporizadores viven en refs para no provocar renders.
    const peticionRef = useRef(null);
    const temporizadorRef = useRef(null);
    const secuenciaRef = useRef(0);
    const oyentesMensaje = useRef(new Set());
    const oyentesFeed = useRef(new Set());

    // Pide el resumen al backend. Cancela la petición anterior si aún corre.
    const recargarFeed = useCallback(async () => {
        peticionRef.current?.abort();

        const controlador = new AbortController();
        peticionRef.current = controlador;

        try {
            const datos = await obtenerFeed({ signal: controlador.signal });

            if (!controlador.signal.aborted) {
                setFeed(datos);
                setErrorFeed('');
            }
        } catch (error) {
            if (error.name === 'AbortError' || controlador.signal.aborted) {
                return;
            }

            setErrorFeed(
                mensajeDeError(
                    error,
                    'No fue posible actualizar las notificaciones.'
                )
            );
        }
    }, []);

    const programarRefresco = useCallback(
        (retraso = RETRASO_REFRESCO_MS) => {
            if (temporizadorRef.current !== null) {
                clearTimeout(temporizadorRef.current);
            }

            temporizadorRef.current = setTimeout(() => {
                temporizadorRef.current = null;
                void recargarFeed();
            }, retraso);
        },
        [recargarFeed]
    );

    const agregarAviso = useCallback((aviso) => {
        secuenciaRef.current += 1;

        const nuevo = {
            ...aviso,
            id: `${aviso.tipo ?? 'aviso'}-${secuenciaRef.current}`
        };

        setAvisos((actuales) => [...actuales, nuevo].slice(-MAXIMO_AVISOS));
    }, []);

    const descartarAviso = useCallback((id) => {
        setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
    }, []);

    // Reparto de los eventos a los componentes interesados (por ejemplo el chat).
    const notificarMensaje = useCallback((mensaje) => {
        for (const oyente of oyentesMensaje.current) {
            oyente(mensaje);
        }
    }, []);

    const notificarFeed = useCallback((cambio) => {
        for (const oyente of oyentesFeed.current) {
            oyente(cambio);
        }
    }, []);

    const suscribirMensaje = useCallback((oyente) => {
        oyentesMensaje.current.add(oyente);

        return () => {
            oyentesMensaje.current.delete(oyente);
        };
    }, []);

    const suscribirFeed = useCallback((oyente) => {
        oyentesFeed.current.add(oyente);

        return () => {
            oyentesFeed.current.delete(oyente);
        };
    }, []);

    const manejarEvento = useCallback(
        ({ tipo, datos }) => {
            if (tipo === 'mensaje') {
                notificarMensaje(datos);

                agregarAviso({
                    tipo: 'mensaje',
                    titulo: `Nuevo mensaje de ${nombreCompleto(datos?.remitente)}`,
                    detalle: datos?.contenido ?? '',
                    ruta: datos?.idConexion
                        ? `/app/mensajes/${datos.idConexion}`
                        : '/app/mensajes'
                });

                programarRefresco(0);
                return;
            }

            if (tipo === 'solicitud') {
                agregarAviso({
                    tipo: 'solicitud',
                    titulo: 'Actualización de una solicitud',
                    detalle: 'Revisa tus solicitudes de conexión.',
                    ruta: '/app/solicitudes'
                });

                programarRefresco(0);
                return;
            }

            if (tipo === 'conexion') {
                agregarAviso({
                    tipo: 'conexion',
                    titulo: 'Conexión actualizada',
                    detalle:
                        datos?.estado === 'finalizada'
                            ? 'Un intercambio terminó y puedes calificarlo.'
                            : 'Revisa tus conexiones.',
                    ruta: '/app/conexiones'
                });

                programarRefresco(0);
                return;
            }

            if (tipo === 'calificacion') {
                agregarAviso({
                    tipo: 'calificacion',
                    titulo: 'Recibiste una nueva calificación',
                    detalle: `Puntuación: ${datos?.puntuacion ?? '—'} de 5.`,
                    ruta: '/app/calificaciones'
                });

                programarRefresco(0);
                return;
            }

            if (tipo === 'feed') {
                notificarFeed({
                    motivo: datos?.motivo ?? 'feed',
                    idConexion: datos?.idConexion ?? null
                });

                programarRefresco();
                return;
            }

            if (tipo === 'vigilancia') {
                void recargarFeed();
                return;
            }

            // Un fallo del flujo SSE también sirve para revalidar la sesión: si
            // el token venció, apiClient la cierra y ProtectedRoute redirige.
            if (tipo === 'error') {
                void recargarFeed();
            }
        },
        [
            agregarAviso,
            notificarFeed,
            notificarMensaje,
            programarRefresco,
            recargarFeed
        ]
    );

    // Estado del canal: cada vez que se abre (o se reabre) el flujo SSE se
    // refresca el feed. Al conectar llega el primer resumen sin necesidad de
    // disparar efectos con setState síncrono.
    const manejarEstado = useCallback(
        (nuevoModo) => {
            setModoConexion(nuevoModo);

            if (nuevoModo === 'conectado') {
                void recargarFeed();
            }
        },
        [recargarFeed]
    );

    // Conexión SSE: una sola conexión compartida por toda la aplicación.
    useEffect(() => {
        if (!autenticado) {
            return undefined;
        }

        const desuscribir = suscribirEventos({
            alEstado: manejarEstado,
            alEvento: manejarEvento
        });

        return () => {
            desuscribir();

            if (temporizadorRef.current !== null) {
                clearTimeout(temporizadorRef.current);
                temporizadorRef.current = null;
            }

            peticionRef.current?.abort();
        };
    }, [autenticado, manejarEstado, manejarEvento]);

    const value = useMemo(
        () => ({
            feed,
            errorFeed,
            modoConexion,
            avisos,
            recargarFeed,
            descartarAviso,
            suscribirMensaje,
            suscribirFeed
        }),
        [
            feed,
            errorFeed,
            modoConexion,
            avisos,
            recargarFeed,
            descartarAviso,
            suscribirMensaje,
            suscribirFeed
        ]
    );

    return (
        <EventosContext.Provider value={value}>
            {children}
        </EventosContext.Provider>
    );
}
