import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { mensajeDeError } from '../../utils/errores.js';

import { listarHabilidades } from '../habilidades/habilidades.api.js';

import FormularioOfrecida from './components/FormularioOfrecida.jsx';
import FormularioRequerida from './components/FormularioRequerida.jsx';
import ListaHabilidades from './components/ListaHabilidades.jsx';

import {
    actualizarOfrecida,
    actualizarRequerida,
    crearOfrecida,
    crearRequerida,
    eliminarOfrecida,
    eliminarRequerida,
    listarOfrecidas,
    listarRequeridas
} from './habilidadesUsuario.api.js';

// Límite del catálogo que se ofrece en los selectores.
const LIMITE_CATALOGO = 50;

export default function MisHabilidadesPage() {
    const [ofrecidas, setOfrecidas] = useState([]);
    const [requeridas, setRequeridas] = useState([]);
    const [catalogo, setCatalogo] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [recarga, setRecarga] = useState(0);

    const [filtroCatalogo, setFiltroCatalogo] = useState('');
    const [buscandoCatalogo, setBuscandoCatalogo] = useState(false);
    const [errorCatalogo, setErrorCatalogo] = useState('');

    const [guardandoOfrecida, setGuardandoOfrecida] = useState(false);
    const [guardandoRequerida, setGuardandoRequerida] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const [ofrecidaEditando, setOfrecidaEditando] = useState(null);
    const [requeridaEditando, setRequeridaEditando] = useState(null);
    const [versionOfrecida, setVersionOfrecida] = useState(0);
    const [versionRequerida, setVersionRequerida] = useState(0);

    const [paraEliminar, setParaEliminar] = useState(null);
    const [errorEliminar, setErrorEliminar] = useState('');

    const ocupado = guardandoOfrecida || guardandoRequerida || eliminando;

    // Catálogo activo para los selectores (se filtra por nombre).
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarCatalogo() {
            try {
                const { habilidades } = await listarHabilidades(
                    {
                        nombre: filtroCatalogo,
                        estado: 'activo',
                        orden: 'nombre',
                        limit: LIMITE_CATALOGO
                    },
                    { signal: controlador.signal }
                );

                if (!controlador.signal.aborted) {
                    setCatalogo(habilidades);
                    setErrorCatalogo('');
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCatalogo(mensajeDeError(error));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setBuscandoCatalogo(false);
                }
            }
        }

        cargarCatalogo();

        return () => controlador.abort();
    }, [filtroCatalogo, recarga]);

    // Habilidades propias: ofrecidas y requeridas.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarMisHabilidades() {
            try {
                const [misOfrecidas, misRequeridas] = await Promise.all([
                    listarOfrecidas({ signal: controlador.signal }),
                    listarRequeridas({ signal: controlador.signal })
                ]);

                if (!controlador.signal.aborted) {
                    setOfrecidas(misOfrecidas);
                    setRequeridas(misRequeridas);
                    setErrorCarga('');
                }
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

        cargarMisHabilidades();

        return () => controlador.abort();
    }, [recarga]);

    function buscarCatalogo(texto) {
        if (texto === filtroCatalogo) {
            return;
        }

        setBuscandoCatalogo(true);
        setFiltroCatalogo(texto);
    }

    async function guardarOfrecida(datos) {
        if (guardandoOfrecida) return false;

        const editando = ofrecidaEditando;

        setGuardandoOfrecida(true);
        setMensaje(null);

        try {
            if (editando) {
                await actualizarOfrecida(editando.idHabilidadOfrecida, datos);
            } else {
                await crearOfrecida(datos);
            }

            setOfrecidaEditando(null);
            setVersionOfrecida((actual) => actual + 1);
            setRecarga((actual) => actual + 1);

            setMensaje({
                type: 'success',
                text: editando
                    ? 'Habilidad ofrecida actualizada.'
                    : 'Habilidad ofrecida registrada.'
            });

            return true;
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error),
                details: error.errors ?? []
            });

            return false;
        } finally {
            setGuardandoOfrecida(false);
        }
    }

    async function guardarRequerida(datos) {
        if (guardandoRequerida) return false;

        const editando = requeridaEditando;

        setGuardandoRequerida(true);
        setMensaje(null);

        try {
            if (editando) {
                await actualizarRequerida(
                    editando.idHabilidadRequerida,
                    datos
                );
            } else {
                await crearRequerida(datos);
            }

            setRequeridaEditando(null);
            setVersionRequerida((actual) => actual + 1);
            setRecarga((actual) => actual + 1);

            setMensaje({
                type: 'success',
                text: editando
                    ? 'Habilidad requerida actualizada.'
                    : 'Habilidad requerida registrada.'
            });

            return true;
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error),
                details: error.errors ?? []
            });

            return false;
        } finally {
            setGuardandoRequerida(false);
        }
    }

    function solicitarEliminacion(tipo, registro) {
        if (ocupado) return;

        setErrorEliminar('');
        setMensaje(null);
        setParaEliminar({ tipo, registro });
    }

    function cancelarEliminacion() {
        if (eliminando) return;

        setParaEliminar(null);
        setErrorEliminar('');
    }

    async function confirmarEliminacion() {
        if (!paraEliminar || eliminando) return;

        const { tipo, registro } = paraEliminar;

        setEliminando(true);
        setErrorEliminar('');

        try {
            if (tipo === 'ofrecida') {
                await eliminarOfrecida(registro.idHabilidadOfrecida);

                if (
                    ofrecidaEditando?.idHabilidadOfrecida ===
                    registro.idHabilidadOfrecida
                ) {
                    setOfrecidaEditando(null);
                    setVersionOfrecida((actual) => actual + 1);
                }
            } else {
                await eliminarRequerida(registro.idHabilidadRequerida);

                if (
                    requeridaEditando?.idHabilidadRequerida ===
                    registro.idHabilidadRequerida
                ) {
                    setRequeridaEditando(null);
                    setVersionRequerida((actual) => actual + 1);
                }
            }

            setParaEliminar(null);
            setRecarga((actual) => actual + 1);

            setMensaje({
                type: 'success',
                text: 'Habilidad eliminada de tu perfil.'
            });
        } catch (error) {
            setErrorEliminar(mensajeDeError(error));
        } finally {
            setEliminando(false);
        }
    }

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Mi perfil</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Mis habilidades
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Publica lo que puedes enseñar y lo que quieres aprender.
                    Estas habilidades aparecen en tu perfil público.
                </p>
            </div>

            {mensaje && (
                <div className="mb-6">
                    <AlertMessage type={mensaje.type}>
                        <p>{mensaje.text}</p>

                        {mensaje.details?.length > 0 && (
                            <ul className="mt-2 list-disc pl-5">
                                {mensaje.details.map((detalle, indice) => (
                                    <li key={indice}>{detalle}</li>
                                ))}
                            </ul>
                        )}
                    </AlertMessage>
                </div>
            )}

            {cargando ? (
                <Cargando mensaje="Cargando tus habilidades…" />
            ) : errorCarga ? (
                <AlertMessage>{errorCarga}</AlertMessage>
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <FormularioOfrecida
                            key={`ofrecida-${versionOfrecida}`}
                            ofrecida={ofrecidaEditando}
                            habilidades={catalogo}
                            onBuscarCatalogo={buscarCatalogo}
                            buscandoCatalogo={buscandoCatalogo}
                            errorCatalogo={errorCatalogo}
                            onGuardar={guardarOfrecida}
                            onCancelar={() => {
                                setOfrecidaEditando(null);
                                setVersionOfrecida((actual) => actual + 1);
                            }}
                            guardando={guardandoOfrecida}
                        />

                        <div>
                            <h2 className="mb-3 text-lg font-semibold text-text-main">
                                Habilidades que ofrezco
                            </h2>

                            <ListaHabilidades
                                tipo="ofrecidas"
                                items={ofrecidas}
                                onEditar={setOfrecidaEditando}
                                onEliminar={(registro) =>
                                    solicitarEliminacion('ofrecida', registro)
                                }
                                ocupado={ocupado}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormularioRequerida
                            key={`requerida-${versionRequerida}`}
                            requerida={requeridaEditando}
                            habilidades={catalogo}
                            onBuscarCatalogo={buscarCatalogo}
                            buscandoCatalogo={buscandoCatalogo}
                            errorCatalogo={errorCatalogo}
                            onGuardar={guardarRequerida}
                            onCancelar={() => {
                                setRequeridaEditando(null);
                                setVersionRequerida((actual) => actual + 1);
                            }}
                            guardando={guardandoRequerida}
                        />

                        <div>
                            <h2 className="mb-3 text-lg font-semibold text-text-main">
                                Habilidades que quiero aprender
                            </h2>

                            <ListaHabilidades
                                tipo="requeridas"
                                items={requeridas}
                                onEditar={setRequeridaEditando}
                                onEliminar={(registro) =>
                                    solicitarEliminacion('requerida', registro)
                                }
                                ocupado={ocupado}
                            />
                        </div>
                    </div>
                </div>
            )}

            {paraEliminar && (
                <ConfirmDialog
                    titulo="Quitar habilidad"
                    descripcion={`¿Deseas quitar «${paraEliminar.registro.habilidad}» de tu perfil?`}
                    textoConfirmar="Sí, quitar"
                    textoOcupado="Quitando…"
                    ocupado={eliminando}
                    error={errorEliminar}
                    onCancel={cancelarEliminacion}
                    onConfirm={confirmarEliminacion}
                />
            )}
        </section>
    );
}
