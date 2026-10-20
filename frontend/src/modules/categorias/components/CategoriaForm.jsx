import { useState } from 'react';

import { validarCategoria } from '../categorias.validation.js';

const valoresIniciales = {
    nombre: '',
    descripcion: '',
    estado: 'activo'
};

const estiloCampo =
    'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

export default function CategoriaForm({ onSave, guardando, categoria = null, onCancel }) {
    const editando = categoria !== null;
    const [datos, setDatos] = useState(() => ({
    nombre: categoria?.nombre ?? '',
    descripcion: categoria?.descripcion ?? '',
    estado: categoria?.estado ?? 'activo'
    }));
    
    const [errores, setErrores] = useState({});

    function cambiarCampo(event) {
        const { name, value } = event.target;

        setDatos((actuales) => ({
        ...actuales,
        [name]: value
        }));

        setErrores((actuales) => ({
        ...actuales,
        [name]: ''
        }));
    }

    async function enviarFormulario(event) {
        event.preventDefault();

        if (guardando) {
        return;
        }

        const nuevosErrores = validarCategoria(datos);

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
        return;
        }

        const guardada = await onSave({
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim() || null,
        estado: datos.estado
        });

        if (guardada) {
        setDatos({ ...valoresIniciales });
        setErrores({});
        }
    }

    function limpiarFormulario() {
        setDatos({ ...valoresIniciales });
        setErrores({});
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
            {editando ? 'Editar categoría' : 'Nueva categoría'}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
            {editando ? 'Edita los datos de la categoría.' : 'Registra un área de conocimiento para SkillMatch.'}
        </p>

        <form
            onSubmit={enviarFormulario}
            noValidate
            className="mt-5"
        >
            <fieldset disabled={guardando} className="space-y-5">
            <div>
                <label
                htmlFor="categoria-nombre"
                className="text-sm font-medium text-slate-700"
                >
                Nombre *
                </label>

                <input
                id="categoria-nombre"
                name="nombre"
                type="text"
                value={datos.nombre}
                onChange={cambiarCampo}
                placeholder="Por ejemplo: Fotografía"
                required
                aria-invalid={Boolean(errores.nombre)}
                aria-describedby="categoria-nombre-ayuda categoria-nombre-error"
                className={estiloCampo}
                />

                <p
                id="categoria-nombre-ayuda"
                className="mt-1 text-xs text-slate-500"
                >
                Máximo 80 caracteres. Actual: {[...datos.nombre].length}.
                </p>

                <p
                id="categoria-nombre-error"
                className="mt-1 text-sm text-red-600"
                aria-live="polite"
                >
                {errores.nombre}
                </p>
            </div>

            <div>
                <label
                htmlFor="categoria-descripcion"
                className="text-sm font-medium text-slate-700"
                >
                Descripción
                </label>

                <textarea
                id="categoria-descripcion"
                name="descripcion"
                rows={4}
                value={datos.descripcion}
                onChange={cambiarCampo}
                placeholder="Describe qué conocimientos agrupa."
                aria-invalid={Boolean(errores.descripcion)}
                aria-describedby="categoria-descripcion-ayuda categoria-descripcion-error"
                className={estiloCampo}
                />

                <p
                id="categoria-descripcion-ayuda"
                className="mt-1 text-xs text-slate-500"
                >
                Opcional. Máximo 255 caracteres.
                {' '}Actual: {[...datos.descripcion].length}.
                </p>

                <p
                id="categoria-descripcion-error"
                className="mt-1 text-sm text-red-600"
                aria-live="polite"
                >
                {errores.descripcion}
                </p>
            </div>

            <div>
                <label
                htmlFor="categoria-estado"
                className="text-sm font-medium text-slate-700"
                >
                Estado
                </label>

                <select
                id="categoria-estado"
                name="estado"
                value={datos.estado}
                onChange={cambiarCampo}
                aria-invalid={Boolean(errores.estado)}
                aria-describedby="categoria-estado-error"
                className={estiloCampo}
                >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                </select>

                <p
                id="categoria-estado-error"
                className="mt-1 text-sm text-red-600"
                aria-live="polite"
                >
                {errores.estado}
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear categoría'}
                </button>

                <button
                type="button"
                onClick={editando ? onCancel : limpiarFormulario}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                {editando ? 'Cancelar edición' : 'Limpiar'}
                </button>
            </div>
            </fieldset>
        </form>
        </section>
    );
}