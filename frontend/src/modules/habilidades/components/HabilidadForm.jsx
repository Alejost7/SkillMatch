import { useState } from 'react';

import CampoArea from '../../../components/CampoArea.jsx';
import CampoSelect from '../../../components/CampoSelect.jsx';
import CampoTexto from '../../../components/CampoTexto.jsx';
import { ESTADOS_HABILIDAD, validarHabilidad } from '../habilidades.validation.js';

const OPCIONES_ESTADO = ESTADOS_HABILIDAD.map((estado) => ({
    valor: estado,
    etiqueta: estado === 'activo' ? 'Activo' : 'Inactivo'
}));

// Valores iniciales del formulario. Al editar se parte de la habilidad.
function valoresDe(habilidad, categorias) {
    const idCategoria = habilidad?.idCategoria
        ? String(habilidad.idCategoria)
        : categorias[0]
          ? String(categorias[0].id_categoria)
          : '';

    return {
        idCategoria,
        nombre: habilidad?.nombre ?? '',
        descripcion: habilidad?.descripcion ?? '',
        estado: habilidad?.estado ?? 'activo'
    };
}

export default function HabilidadForm({
    habilidad = null,
    categorias = [],
    guardando = false,
    onSave,
    onCancel
}) {
    const editando = habilidad !== null;
    const sinCategorias = categorias.length === 0;

    const [datos, setDatos] = useState(() => valoresDe(habilidad, categorias));
    const [errores, setErrores] = useState({});

    function cambiarCampo(evento) {
        const { name, value } = evento.target;

        setDatos((actuales) => ({ ...actuales, [name]: value }));
        setErrores((actuales) => ({ ...actuales, [name]: '' }));
    }

    async function enviarFormulario(evento) {
        evento.preventDefault();

        if (guardando) {
            return;
        }

        const nuevosErrores = validarHabilidad(datos);

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        const guardada = await onSave({
            idCategoria: Number(datos.idCategoria),
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion.trim() || null,
            estado: datos.estado
        });

        if (guardada) {
            setDatos(valoresDe(null, categorias));
            setErrores({});
        }
    }

    function limpiarFormulario() {
        setDatos(valoresDe(null, categorias));
        setErrores({});
    }

    return (
        <section className="rounded-2xl border border-slate-800 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-main">
                {editando ? 'Editar habilidad' : 'Nueva habilidad'}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                {editando
                    ? 'Actualiza los datos del catálogo.'
                    : 'Agrega una habilidad al catálogo de una categoría.'}
            </p>

            {sinCategorias && (
                <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
                    Primero debes crear al menos una categoría.
                </p>
            )}

            <form onSubmit={enviarFormulario} noValidate className="mt-5">
                <fieldset
                    disabled={guardando || sinCategorias}
                    className="space-y-4"
                >
                    <CampoSelect
                        id="habilidad-categoria"
                        name="idCategoria"
                        label="Categoría *"
                        value={datos.idCategoria}
                        onChange={cambiarCampo}
                        error={errores.idCategoria}
                        placeholder="Selecciona una categoría"
                        opciones={categorias.map((categoria) => ({
                            valor: String(categoria.id_categoria),
                            etiqueta: categoria.nombre
                        }))}
                    />

                    <CampoTexto
                        id="habilidad-nombre"
                        name="nombre"
                        label="Nombre *"
                        value={datos.nombre}
                        onChange={cambiarCampo}
                        error={errores.nombre}
                        ayuda="Máximo 100 caracteres."
                        maxLength={100}
                        placeholder="Por ejemplo: JavaScript"
                        required
                    />

                    <CampoArea
                        id="habilidad-descripcion"
                        name="descripcion"
                        label="Descripción"
                        value={datos.descripcion}
                        onChange={cambiarCampo}
                        error={errores.descripcion}
                        ayuda="Opcional. Máximo 255 caracteres."
                        maximo={255}
                        maxLength={255}
                        rows={3}
                        placeholder="Describe la habilidad en pocas palabras."
                    />

                    <CampoSelect
                        id="habilidad-estado"
                        name="estado"
                        label="Estado"
                        value={datos.estado}
                        onChange={cambiarCampo}
                        error={errores.estado}
                        opciones={OPCIONES_ESTADO}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {guardando
                                ? 'Guardando…'
                                : editando
                                  ? 'Guardar cambios'
                                  : 'Crear habilidad'}
                        </button>

                        <button
                            type="button"
                            onClick={editando ? onCancel : limpiarFormulario}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            {editando ? 'Cancelar edición' : 'Limpiar'}
                        </button>
                    </div>
                </fieldset>
            </form>
        </section>
    );
}
