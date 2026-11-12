import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import { mensajeDeError } from '../../utils/errores.js';
import { nombreCompleto } from '../../utils/formato.js';

import { listarConexiones } from '../conexiones/conexiones.api.js';

import ListaConversaciones from './components/ListaConversaciones.jsx';

// Las conversaciones se cargan en una sola página: se ordenan por conexión y
// el usuario filtra por nombre en el cliente.
const LIMITE_CONVERSACIONES = 50;

export default function BandejaPage() {
    const [conexiones, setConexiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarConversaciones() {
            try {
                const resultado = await listarConexiones(
                    { limit: LIMITE_CONVERSACIONES },
                    { signal: controlador.signal }
                );

                if (!controlador.signal.aborted) {
                    setConexiones(resultado.conexiones);
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

        cargarConversaciones();

        return () => controlador.abort();
    }, []);

    const texto = busqueda.trim().toLowerCase();

    const filtradas = texto
        ? conexiones.filter((conexion) =>
              nombreCompleto(conexion.interlocutor)
                  .toLowerCase()
                  .includes(texto)
          )
        : conexiones;

    const totalSinLeer = conexiones.reduce(
        (suma, conexion) => suma + (conexion.noLeidos ?? 0),
        0
    );

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Mensajería</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Mensajes
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Conversa con las personas con las que tienes una conexión.
                    {totalSinLeer > 0 &&
                        ` Tienes ${totalSinLeer} ${totalSinLeer === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}.`}
                </p>
            </div>

            <div className="mb-4">
                <label htmlFor="buscar-conversacion" className="sr-only">
                    Buscar conversación por nombre
                </label>

                <input
                    id="buscar-conversacion"
                    type="search"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    placeholder="Buscar por nombre o alias"
                    className="w-full max-w-sm rounded-lg border border-slate-700 bg-surface-alt px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {error && (
                <div className="mb-4">
                    <AlertMessage>{error}</AlertMessage>
                </div>
            )}

            {cargando ? (
                <Cargando mensaje="Cargando conversaciones…" />
            ) : filtradas.length === 0 ? (
                <EstadoVacio
                    titulo={
                        conexiones.length === 0
                            ? 'Todavía no tienes conversaciones'
                            : 'No encontramos esa conversación'
                    }
                >
                    {conexiones.length === 0
                        ? 'Cuando aceptes una solicitud de conexión podrás escribir mensajes.'
                        : 'Prueba con otro nombre.'}
                </EstadoVacio>
            ) : (
                <ListaConversaciones conexiones={filtradas} />
            )}
        </section>
    );
}
