import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

import CategoriaForm from './components/CategoriaForm.jsx';
import CategoriasTable from './components/CategoriasTable.jsx';

import {
    listarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from './categorias.api.js';

function obtenerMensajeError(error) {
    if (error instanceof TypeError) {
        return 'No fue posible conectar con el servidor.';
    }

    return error.message || 'Ocurrió un error inesperado.';
}

function ordenarCategorias(categorias) {
    return [...categorias].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es')
    );
}

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const [errorCarga, setErrorCarga] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [errorEliminar, setErrorEliminar] = useState('');

    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [categoriaEliminar, setCategoriaEliminar] = useState(null);
    const [versionFormulario, setVersionFormulario] = useState(0);

    const ocupado = guardando || eliminando;

    useEffect(() => {
        const controller = new AbortController();

        async function cargarCategorias() {
        try {
            const datos = await listarCategorias({
            signal: controller.signal
            });

            if (!controller.signal.aborted) {
            setCategorias(ordenarCategorias(datos));
            }
        } catch (error) {
            if (!controller.signal.aborted) {
            setErrorCarga(obtenerMensajeError(error));
            }
        } finally {
            if (!controller.signal.aborted) {
            setCargando(false);
            }
        }
        }

        cargarCategorias();

        return () => controller.abort();
    }, []);

    function reiniciarFormulario() {
        setCategoriaEditando(null);
        setVersionFormulario((actual) => actual + 1);
    }

    function iniciarEdicion(categoria) {
        if (ocupado) return;

        setMensaje(null);
        setCategoriaEditando(categoria);
        setVersionFormulario((actual) => actual + 1);
    }

    function cancelarEdicion() {
        if (ocupado) return;

        setMensaje(null);
        reiniciarFormulario();
    }

    async function guardarCategoria(datos) {
        if (ocupado) return false;

        setGuardando(true);
        setMensaje(null);

        const idEditando = categoriaEditando?.id_categoria;

        try {
        const categoria = idEditando
            ? await actualizarCategoria(idEditando, datos)
            : await crearCategoria(datos);

        setCategorias((actuales) => {
            const nuevas = idEditando
            ? actuales.map((actual) =>
                actual.id_categoria === idEditando
                    ? categoria
                    : actual
                )
            : [...actuales, categoria];

            return ordenarCategorias(nuevas);
        });

        setMensaje({
            type: 'success',
            text: idEditando
            ? 'Categoría actualizada correctamente.'
            : 'Categoría creada correctamente.',
            details: []
        });

        if (idEditando) {
            reiniciarFormulario();
        }

        return true;
        } catch (error) {
        setMensaje({
            type: 'error',
            text: obtenerMensajeError(error),
            details: Array.isArray(error.errors) ? error.errors : []
        });

        return false;
        } finally {
        setGuardando(false);
        }
    }

    function solicitarEliminacion(categoria) {
        if (ocupado) return;

        setMensaje(null);
        setErrorEliminar('');
        setCategoriaEliminar(categoria);
    }

    function cancelarEliminacion() {
        if (eliminando) return;

        setCategoriaEliminar(null);
        setErrorEliminar('');
    }

    async function confirmarEliminacion() {
        if (!categoriaEliminar || ocupado) return;

        const id = categoriaEliminar.id_categoria;

        setEliminando(true);
        setErrorEliminar('');

        try {
        await eliminarCategoria(id);

        setCategorias((actuales) =>
            actuales.filter((categoria) => categoria.id_categoria !== id)
        );

        if (categoriaEditando?.id_categoria === id) {
            reiniciarFormulario();
        }

        setCategoriaEliminar(null);

        setMensaje({
            type: 'success',
            text: 'Categoría eliminada correctamente.',
            details: []
        });
        } catch (error) {
        setErrorEliminar(obtenerMensajeError(error));
        } finally {
        setEliminando(false);
        }
    }

    return (
        <section>
        <div className="mb-6">
            <p className="text-sm font-medium text-indigo-600">
            Catálogo de conocimientos
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Categorías
            </h1>

            <p className="mt-2 text-slate-600">
            Administra las áreas que organizan las habilidades de SkillMatch.
            </p>
        </div>

        {cargando ? (
            <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500"
            >
            Cargando categorías…
            </div>
        ) : errorCarga ? (
            <AlertMessage>{errorCarga}</AlertMessage>
        ) : (
            <>
            {mensaje && (
                <div className="mb-6">
                <AlertMessage type={mensaje.type}>
                    <p>{mensaje.text}</p>

                    {mensaje.details.length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                        {mensaje.details.map((detalle, index) => (
                        <li key={index}>{detalle}</li>
                        ))}
                    </ul>
                    )}
                </AlertMessage>
                </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div>
                <CategoriaForm
                    key={versionFormulario}
                    categoria={categoriaEditando}
                    onSave={guardarCategoria}
                    onCancel={cancelarEdicion}
                    guardando={ocupado}
                />
                </div>

                <div className="min-w-0 lg:col-span-2">
                <p className="mb-3 text-sm text-slate-500">
                    Total de categorías: {categorias.length}
                </p>

                <CategoriasTable
                    categorias={categorias}
                    onEdit={iniciarEdicion}
                    onDelete={solicitarEliminacion}
                    ocupado={ocupado}
                />
                </div>
            </div>

            {categoriaEliminar && (
                <ConfirmDialog
                nombre={categoriaEliminar.nombre}
                ocupado={eliminando}
                error={errorEliminar}
                onCancel={cancelarEliminacion}
                onConfirm={confirmarEliminacion}
                />
            )}
            </>
        )}
        </section>
    );
}