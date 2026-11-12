import { useState } from 'react';

import CampoArea from '../../../components/CampoArea.jsx';
import CampoSelect from '../../../components/CampoSelect.jsx';
import {
    OPCIONES_ESTADO,
    OPCIONES_NIVEL,
    validarOfrecida
} from '../habilidadesUsuario.validation.js';
import SelectorHabilidad from './SelectorHabilidad.jsx';

function valoresDe(ofrecida) {
    return {
        idHabilidad: ofrecida?.idHabilidad
            ? String(ofrecida.idHabilidad)
            : '',
        nivel: ofrecida?.nivel ?? 'intermedio',
        descripcionApoyo: ofrecida?.descripcionApoyo ?? '',
        estado: ofrecida?.estado ?? 'activo'
    };
}

/**
 * Formulario para registrar o editar una habilidad ofrecida.
 * Se usa con la misma pieza en los dos modos.
 */
export default function FormularioOfrecida({
    ofrecida = null,
    habilidades = [],
    onBuscarCatalogo,
    buscandoCatalogo = false,
    errorCatalogo = '',
    onGuardar,
    onCancelar,
    guardando = false
}) {
    const editando = ofrecida !== null;

    const [datos, setDatos] = useState(() => valoresDe(ofrecida));
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

        const nuevosErrores = validarOfrecida(datos);

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        const guardada = await onGuardar({
            idHabilidad: Number(datos.idHabilidad),
            nivel: datos.nivel,
            descripcionApoyo: datos.descripcionApoyo.trim() || null,
            estado: datos.estado
        });

        if (guardada && !editando) {
            setDatos(valoresDe(null));
            setErrores({});
        }
    }

    return (
        <section className="rounded-2xl border border-slate-800 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-main">
                {editando ? 'Editar habilidad ofrecida' : 'Ofrecer una habilidad'}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                Registra lo que puedes enseñar y el nivel en el que lo haces.
            </p>

            <form onSubmit={enviarFormulario} noValidate className="mt-5">
                <fieldset disabled={guardando} className="space-y-4">
                    <SelectorHabilidad
                        id="ofrecida-habilidad"
                        label="Habilidad *"
                        habilidades={habilidades}
                        valor={datos.idHabilidad}
                        onCambio={cambiarCampo}
                        onBuscar={onBuscarCatalogo}
                        buscando={buscandoCatalogo}
                        error={errores.idHabilidad}
                    />

                    {errorCatalogo && (
                        <p role="alert" className="text-sm text-danger">
                            {errorCatalogo}
                        </p>
                    )}

                    <CampoSelect
                        id="ofrecida-nivel"
                        name="nivel"
                        label="Nivel"
                        value={datos.nivel}
                        onChange={cambiarCampo}
                        error={errores.nivel}
                        opciones={OPCIONES_NIVEL}
                    />

                    <CampoArea
                        id="ofrecida-descripcion"
                        name="descripcionApoyo"
                        label="Descripción de apoyo"
                        value={datos.descripcionApoyo}
                        onChange={cambiarCampo}
                        error={errores.descripcionApoyo}
                        ayuda="Opcional. Explica cómo puedes ayudar."
                        maximo={500}
                        maxLength={500}
                        rows={3}
                    />

                    <CampoSelect
                        id="ofrecida-estado"
                        name="estado"
                        label="Estado"
                        value={datos.estado}
                        onChange={cambiarCampo}
                        error={errores.estado}
                        opciones={OPCIONES_ESTADO}
                        ayuda="Inactivo oculta la habilidad de tu perfil público."
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
                                  : 'Añadir habilidad'}
                        </button>

                        {editando && (
                            <button
                                type="button"
                                onClick={onCancelar}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>
                </fieldset>
            </form>
        </section>
    );
}
