import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { mensajeDeError } from '../../utils/errores.js';
import {
    formatearFecha,
    formatearPromedio,
    iniciales,
    nombreCompleto
} from '../../utils/formato.js';

import ListaCalificaciones from '../calificaciones/components/ListaCalificaciones.jsx';
import ResumenCalificaciones from '../calificaciones/components/ResumenCalificaciones.jsx';
import { listarCalificacionesUsuario } from '../calificaciones/calificaciones.api.js';
import FormularioSolicitud from '../solicitudes/components/FormularioSolicitud.jsx';

import HabilidadesResumen from './components/HabilidadesResumen.jsx';
import { obtenerUsuario } from './usuarios.api.js';

const CALIFICACIONES_POR_PAGINA = 5;

export default function UsuarioDetallePage() {
    const { id } = useParams();
    const { usuario: sesion } = useAuth();

    const [usuario, setUsuario] = useState(null);
    const [cargandoPerfil, setCargandoPerfil] = useState(true);
    const [errorPerfil, setErrorPerfil] = useState('');

    const [calificaciones, setCalificaciones] = useState({
        lista: [],
        resumen: null,
        paginacion: null
    });
    const [cargandoCalificaciones, setCargandoCalificaciones] =
        useState(true);
    const [errorCalificaciones, setErrorCalificaciones] = useState('');
    const [pagina, setPagina] = useState(1);

    // Perfil público del usuario.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarUsuario() {
            try {
                const datos = await obtenerUsuario(id, {
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setUsuario(datos);
                    setErrorPerfil('');
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorPerfil(mensajeDeError(error));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargandoPerfil(false);
                }
            }
        }

        cargarUsuario();

        return () => controlador.abort();
    }, [id]);

    // Calificaciones recibidas, con paginación.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarCalificaciones() {
            try {
                const resultado = await listarCalificacionesUsuario(
                    id,
                    {
                        page: pagina,
                        limit: CALIFICACIONES_POR_PAGINA
                    },
                    { signal: controlador.signal }
                );

                if (!controlador.signal.aborted) {
                    setCalificaciones({
                        lista: resultado.calificaciones,
                        resumen: resultado.resumen,
                        paginacion: resultado.paginacion
                    });
                    setErrorCalificaciones('');
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCalificaciones(mensajeDeError(error));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargandoCalificaciones(false);
                }
            }
        }

        cargarCalificaciones();

        return () => controlador.abort();
    }, [id, pagina]);

    function cambiarPaginaCalificaciones(destino) {
        setCargandoCalificaciones(true);
        setPagina(destino);
    }

    if (cargandoPerfil) {
        return <Cargando mensaje="Cargando el perfil…" />;
    }

    if (errorPerfil) {
        return (
            <div className="space-y-4">
                <AlertMessage>{errorPerfil}</AlertMessage>

                <Link
                    to="/app/buscar"
                    className="inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                >
                    Volver al buscador
                </Link>
            </div>
        );
    }

    const esMiPerfil = Number(id) === sesion?.idUsuario;
    const calificacion = usuario?.calificacion;
    const perfil = usuario?.perfil ?? {};
    const ubicacion = [perfil.ciudad, perfil.pais]
        .filter(Boolean)
        .join(', ');

    return (
        <section>
            <div className="rounded-2xl border border-slate-800 bg-surface p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {perfil.fotoPerfilUrl ? (
                        <img
                            src={perfil.fotoPerfilUrl}
                            alt={`Foto de ${nombreCompleto(usuario)}`}
                            className="h-20 w-20 shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                            {iniciales(usuario)}
                        </span>
                    )}

                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold text-text-main">
                            {nombreCompleto(usuario)}
                        </h1>

                        <p className="text-sm text-text-muted">
                            {usuario.alias ? `@${usuario.alias}` : 'Sin alias'}
                            {ubicacion ? ` · ${ubicacion}` : ''}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                            Miembro desde {formatearFecha(usuario.fechaRegistro)}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-accent">
                            {calificacion?.total
                                ? `★ ${formatearPromedio(calificacion.promedio, calificacion.total)} · ${calificacion.total} calificaciones`
                                : 'Sin calificaciones todavía'}
                        </p>

                        {perfil.disponibilidad && (
                            <p className="mt-2 text-sm text-text-main">
                                <span className="text-text-muted">
                                    Disponibilidad:{' '}
                                </span>
                                {perfil.disponibilidad}
                            </p>
                        )}
                    </div>

                    {esMiPerfil && (
                        <Link
                            to="/app/perfil"
                            className="rounded-lg border border-primary px-4 py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/10"
                        >
                            Editar mi perfil
                        </Link>
                    )}
                </div>

                {perfil.biografia && (
                    <p className="mt-4 whitespace-pre-line text-sm text-text-main">
                        {perfil.biografia}
                    </p>
                )}
            </div>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-2xl border border-slate-800 bg-surface p-6">
                        <h2 className="text-lg font-semibold text-text-main">
                            Habilidades
                        </h2>

                        <div className="mt-3">
                            <HabilidadesResumen
                                habilidades={usuario.habilidades}
                                limite={20}
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-text-main">
                            Calificaciones recibidas
                        </h2>

                        {errorCalificaciones && (
                            <div className="mb-3">
                                <AlertMessage>
                                    {errorCalificaciones}
                                </AlertMessage>
                            </div>
                        )}

                        {cargandoCalificaciones ? (
                            <Cargando mensaje="Cargando calificaciones…" />
                        ) : (
                            <>
                                <ListaCalificaciones
                                    calificaciones={calificaciones.lista}
                                    vacio="Este usuario todavía no tiene calificaciones."
                                />

                                <Paginacion
                                    paginacion={calificaciones.paginacion}
                                    onAnterior={() =>
                                        cambiarPaginaCalificaciones(pagina - 1)
                                    }
                                    onSiguiente={() =>
                                        cambiarPaginaCalificaciones(pagina + 1)
                                    }
                                    deshabilitado={cargandoCalificaciones}
                                />
                            </>
                        )}
                    </section>
                </div>

                <aside className="space-y-4">
                    <ResumenCalificaciones resumen={calificaciones.resumen} />

                    {esMiPerfil ? (
                        <div className="rounded-2xl border border-slate-800 bg-surface p-6 text-sm text-text-muted">
                            Este es tu perfil público. Así lo ven las demás
                            personas de la comunidad.
                        </div>
                    ) : (
                        <FormularioSolicitud
                            idUsuarioReceptor={usuario.idUsuario}
                        />
                    )}

                    <Link
                        to="/app/buscar"
                        className="block rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-text-main transition hover:bg-slate-800"
                    >
                        Volver al buscador
                    </Link>
                </aside>
            </div>
        </section>
    );
}
