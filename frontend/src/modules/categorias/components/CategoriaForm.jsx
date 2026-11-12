import { useState } from 'react';

import CampoArea from '../../../components/CampoArea.jsx';
import CampoSelect from '../../../components/CampoSelect.jsx';
import CampoTexto from '../../../components/CampoTexto.jsx';
import { validarCategoria } from '../categorias.validation.js';

const valoresIniciales = {
    nombre: '',
    descripcion: '',
    estado: 'activo'
};

const OPCIONES_ESTADO = [
    { valor: 'activo', etiqueta: 'Activo' },
    { valor: 'inactivo', etiqueta: 'Inactivo' }
];

export default function CategoriaForm({
    onSave,
    guardando,
    categoria = null,
    onCancel
}) {
    const editando = categoria !== null;

    const [datos, setDatos] = useState(() => ({
        nombre: categoria?.nombre ?? '',
        descripcion: categoria?.descripcion ?? '',
        estado: categoria?.estado ?? 'activo'
    }));

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
        <section className="rounded-2xl border border-slate-800 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-main">
                {editando ? 'Editar categoría' : 'Nueva categoría'}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                {editando
                    ? 'Edita los datos de la categoría seleccionada.'
                    : 'Registra un área de conocimiento para SkillMatch.'}
            </p>

            <form onSubmit={enviarFormulario} noValidate className="mt-5">
                <fieldset disabled={guardando} className="space-y-4">
                    <CampoTexto
                        id="categoria-nombre"
                        name="nombre"
                        label="Nombre *"
                        value={datos.nombre}
                        onChange={cambiarCampo}
                        error={errores.nombre}
                        ayuda="Máximo 80 caracteres."
                        maxLength={80}
                        placeholder="Por ejemplo: Fotografía"
                        required
                    />

                    <CampoArea
                        id="categoria-descripcion"
                        name="descripcion"
                        label="Descripción"
                        value={datos.descripcion}
                        onChange={cambiarCampo}
                        error={errores.descripcion}
                        ayuda="Opcional. Máximo 255 caracteres."
                        maximo={255}
                        maxLength={255}
                        rows={4}
                        placeholder="Describe qué conocimientos agrupa."
                    />

                    <CampoSelect
                        id="categoria-estado"
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
                                  : 'Crear categoría'}
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
