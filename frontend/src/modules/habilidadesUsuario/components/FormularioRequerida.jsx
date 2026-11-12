import { useState } from 'react';

import CampoArea from '../../../components/CampoArea.jsx';
import CampoSelect from '../../../components/CampoSelect.jsx';
import {
    OPCIONES_ESTADO,
    OPCIONES_NIVEL,
    validarRequerida
} from '../habilidadesUsuario.validation.js';
import SelectorHabilidad from './SelectorHabilidad.jsx';

function valoresDe(requerida) {
    return {
        idHabilidad: requerida?.idHabilidad
            ? String(requerida.idHabilidad)
            : '',
        nivelDeseado: requerida?.nivelDeseado ?? 'basico',
        objetivoAprendizaje: requerida?.objetivoAprendizaje ?? '',
        estado: requerida?.estado ?? 'activo'
    };
}

/**
 * Formulario para registrar o editar una habilidad requerida.
 */
export default function FormularioRequerida({
    requerida = null,
    habilidades = [],
    onBuscarCatalogo,
    buscandoCatalogo = false,
    errorCatalogo = '',
    onGuardar,
    onCancelar,
    guardando = false
}) {
    const editando = requerida !== null;

    const [datos, setDatos] = useState(() => valoresDe(requerida));
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

        const nuevosErrores = validarRequerida(datos);

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        const guardada = await onGuardar({
            idHabilidad: Number(datos.idHabilidad),
            nivelDeseado: datos.nivelDeseado,
            objetivoAprendizaje: datos.objetivoAprendizaje.trim() || null,
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
                {editando
                    ? 'Editar habilidad requerida'
                    : 'Quiero aprender una habilidad'}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                Cuéntale a la comunidad qué te gustaría aprender.
            </p>

            <form onSubmit={enviarFormulario} noValidate className="mt-5">
                <fieldset disabled={guardando} className="space-y-4">
                    <SelectorHabilidad
                        id="requerida-habilidad"
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
                        id="requerida-nivel"
                        name="nivelDeseado"
                        label="Nivel deseado"
                        value={datos.nivelDeseado}
                        onChange={cambiarCampo}
                        error={errores.nivelDeseado}
                        opciones={OPCIONES_NIVEL}
                    />

                    <CampoArea
                        id="requerida-objetivo"
                        name="objetivoAprendizaje"
                        label="Objetivo de aprendizaje"
                        value={datos.objetivoAprendizaje}
                        onChange={cambiarCampo}
                        error={errores.objetivoAprendizaje}
                        ayuda="Opcional. ¿Para qué quieres aprenderlo?"
                        maximo={500}
                        maxLength={500}
                        rows={3}
                    />

                    <CampoSelect
                        id="requerida-estado"
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
