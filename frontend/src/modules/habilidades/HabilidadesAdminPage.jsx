import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { mensajeDeError } from '../../utils/errores.js';

import { listarCategorias } from '../categorias/categorias.api.js';

import HabilidadForm from './components/HabilidadForm.jsx';
import HabilidadesFiltros from './components/HabilidadesFiltros.jsx';
import HabilidadesTabla from './components/HabilidadesTabla.jsx';

import {
    actualizarHabilidad,
    crearHabilidad,
    eliminarHabilidad,
    listarHabilidades
} from './habilidades.api.js';

const FILTROS_INICIALES = {
    nombre: '',
    categoriaId: '',
    estado: '',
    orden: 'nombre'
};

const TAMANO_PAGINA = 10;

export default function HabilidadesAdminPage() {
    const [categorias, setCategorias] = useState([]);
    const [borrador, setBorrador] = useState(FILTROS_INICIALES);

    // "consulta" es lo que se envía al backend; cambia al aplicar filtros o
    // cambiar de página, y dispara la carga.
    const [consulta, setConsulta] = useState({
        ...FILTROS_INICIALES,
        page: 1,
        limit: TAMANO_PAGINA
    });

    const [datos, setDatos] = useState({ habilidades: [], paginacion: null });
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [recarga, setRecarga] = useState(0);

    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const [habilidadEditando, setHabilidadEditando] = useState(null);
    const [habilidadEliminar, setHabilidadEliminar] = useState(null);
    const [errorEliminar, setErrorEliminar] = useState('');
    const [versionFormulario, setVersionFormulario] = useState(0);

    const ocupado = guardando || eliminando;

    // Categorías para el formulario y para el filtro.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarCategorias() {
            try {
                const lista = await listarCategorias({
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setCategorias(lista);
                }
            } catch {
                // Si falla, el formulario indica que no hay categorías y la
                // tabla muestra su propio error de carga.
            }
        }

        cargarCategorias();

        return () => controlador.abort();
    }, []);

    // Catálogo según los filtros aplicados.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarHabilidades() {
            try {
                const resultado = await listarHabilidades(consulta, {
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setDatos(resultado);
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

        cargarHabilidades();

        return () => controlador.abort();
    }, [consulta, recarga]);

    function reiniciarFormulario() {
        setHabilidadEditando(null);
        setVersionFormulario((actual) => actual + 1);
    }

    function recargarCatalogo() {
        setCargando(true);
        setRecarga((actual) => actual + 1);
    }

    function cambiarFiltro(evento) {
        const { name, value } = evento.target;

        setBorrador((actuales) => ({ ...actuales, [name]: value }));
    }

    function aplicarFiltros(evento) {
        evento?.preventDefault();

        setCargando(true);
        setConsulta({ ...borrador, page: 1, limit: TAMANO_PAGINA });
    }

    function limpiarFiltros() {
        setBorrador(FILTROS_INICIALES);
        setCargando(true);
        setConsulta({ ...FILTROS_INICIALES, page: 1, limit: TAMANO_PAGINA });
    }

    function cambiarPagina(pagina) {
        setCargando(true);
        setConsulta((actual) => ({ ...actual, page: pagina }));
    }

    function iniciarEdicion(habilidad) {
        if (ocupado) return;

        setMensaje(null);
        setHabilidadEditando(habilidad);
        setVersionFormulario((actual) => actual + 1);
    }

    function cancelarEdicion() {
        if (ocupado) return;

        setMensaje(null);
        reiniciarFormulario();
    }

    async function guardarHabilidad(datosHabilidad) {
        if (ocupado) return false;

        setGuardando(true);
        setMensaje(null);

        const idEditando = habilidadEditando?.id_habilidad;

        try {
            if (idEditando) {
                await actualizarHabilidad(idEditando, datosHabilidad);
            } else {
                await crearHabilidad(datosHabilidad);
            }

            reiniciarFormulario();
            recargarCatalogo();

            setMensaje({
                type: 'success',
                text: idEditando
                    ? 'Habilidad actualizada correctamente.'
                    : 'Habilidad creada correctamente.',
                details: []
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
            setGuardando(false);
        }
    }

    function solicitarEliminacion(habilidad) {
        if (ocupado) return;

        setErrorEliminar('');
        setMensaje(null);
        setHabilidadEliminar(habilidad);
    }

    function cancelarEliminacion() {
        if (eliminando) return;

        setHabilidadEliminar(null);
        setErrorEliminar('');
    }

    async function confirmarEliminacion() {
        if (!habilidadEliminar || eliminando) return;

        setEliminando(true);
        setErrorEliminar('');

        try {
            await eliminarHabilidad(habilidadEliminar.id_habilidad);

            if (
                habilidadEditando?.id_habilidad ===
                habilidadEliminar.id_habilidad
            ) {
                reiniciarFormulario();
            }

            setHabilidadEliminar(null);
            recargarCatalogo();

            setMensaje({
                type: 'success',
                text: 'Habilidad eliminada correctamente.',
                details: []
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
                <p className="text-sm font-medium text-primary">
                    Catálogo de conocimientos
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Habilidades
                </h1>

                <p className="mt-2 text-text-muted">
                    Administra las habilidades que las personas pueden ofrecer
                    o aprender.
                </p>
            </div>

            {mensaje && (
                <div className="mb-6">
                    <AlertMessage type={mensaje.type}>
                        <p>{mensaje.text}</p>

                        {mensaje.details.length > 0 && (
                            <ul className="mt-2 list-disc pl-5">
                                {mensaje.details.map((detalle, indice) => (
                                    <li key={indice}>{detalle}</li>
                                ))}
                            </ul>
                        )}
                    </AlertMessage>
                </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div>
                    <HabilidadForm
                        key={versionFormulario}
                        habilidad={habilidadEditando}
                        categorias={categorias}
                        onSave={guardarHabilidad}
                        onCancel={cancelarEdicion}
                        guardando={ocupado}
                    />
                </div>

                <div className="min-w-0 space-y-4 lg:col-span-2">
                    <HabilidadesFiltros
                        valores={borrador}
                        categorias={categorias}
                        onCambiar={cambiarFiltro}
                        onAplicar={aplicarFiltros}
                        onLimpiar={limpiarFiltros}
                        cargando={cargando}
                    />

                    {errorCarga && <AlertMessage>{errorCarga}</AlertMessage>}

                    {cargando ? (
                        <Cargando mensaje="Cargando habilidades…" />
                    ) : (
                        <>
                            <HabilidadesTabla
                                habilidades={datos.habilidades}
                                onEdit={iniciarEdicion}
                                onDelete={solicitarEliminacion}
                                ocupado={ocupado}
                            />

                            <Paginacion
                                paginacion={datos.paginacion}
                                onAnterior={() =>
                                    cambiarPagina(
                                        datos.paginacion.pagina - 1
                                    )
                                }
                                onSiguiente={() =>
                                    cambiarPagina(
                                        datos.paginacion.pagina + 1
                                    )
                                }
                                deshabilitado={ocupado}
                            />
                        </>
                    )}
                </div>
            </div>

            {habilidadEliminar && (
                <ConfirmDialog
                    titulo="Eliminar habilidad"
                    descripcion={`¿Deseas eliminar la habilidad «${habilidadEliminar.nombre}»? Si está asociada a usuarios, el sistema no permitirá borrarla.`}
                    textoConfirmar="Sí, eliminar"
                    textoOcupado="Eliminando…"
                    ocupado={eliminando}
                    error={errorEliminar}
                    onCancel={cancelarEliminacion}
                    onConfirm={confirmarEliminacion}
                />
            )}
        </section>
    );
}
