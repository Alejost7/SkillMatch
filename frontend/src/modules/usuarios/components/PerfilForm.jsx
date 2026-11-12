import { useState } from 'react';

import CampoArea from '../../../components/CampoArea.jsx';
import CampoTexto from '../../../components/CampoTexto.jsx';
import { validarPerfil } from '../usuarios.validation.js';

// Convierte el perfil del backend en los valores del formulario.
function valoresDe(perfil) {
    return {
        nombres: perfil?.nombres ?? '',
        apellidos: perfil?.apellidos ?? '',
        alias: perfil?.alias ?? '',
        biografia: perfil?.perfil?.biografia ?? '',
        fotoPerfilUrl: perfil?.perfil?.fotoPerfilUrl ?? '',
        disponibilidad: perfil?.perfil?.disponibilidad ?? '',
        ciudad: perfil?.perfil?.ciudad ?? '',
        pais: perfil?.perfil?.pais ?? ''
    };
}

export default function PerfilForm({ perfil, onSave, guardando = false }) {
    const [datos, setDatos] = useState(() => valoresDe(perfil));
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

        const nuevosErrores = validarPerfil(datos);

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        await onSave({
            nombres: datos.nombres.trim(),
            apellidos: datos.apellidos.trim(),
            alias: datos.alias.trim() || null,
            biografia: datos.biografia.trim() || null,
            fotoPerfilUrl: datos.fotoPerfilUrl.trim() || null,
            disponibilidad: datos.disponibilidad.trim() || null,
            ciudad: datos.ciudad.trim() || null,
            pais: datos.pais.trim() || null
        });
    }

    return (
        <form
            onSubmit={enviarFormulario}
            noValidate
            className="rounded-2xl border border-slate-800 bg-surface p-6"
        >
            <h2 className="text-lg font-semibold text-text-main">
                Datos personales
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                Los campos opcionales vacíos se guardan como «sin dato».
            </p>

            <fieldset disabled={guardando} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <CampoTexto
                        id="perfil-nombres"
                        name="nombres"
                        label="Nombres *"
                        value={datos.nombres}
                        onChange={cambiarCampo}
                        error={errores.nombres}
                        maxLength={100}
                        autoComplete="given-name"
                        required
                    />

                    <CampoTexto
                        id="perfil-apellidos"
                        name="apellidos"
                        label="Apellidos *"
                        value={datos.apellidos}
                        onChange={cambiarCampo}
                        error={errores.apellidos}
                        maxLength={100}
                        autoComplete="family-name"
                        required
                    />
                </div>

                <CampoTexto
                    id="perfil-alias"
                    name="alias"
                    label="Alias"
                    value={datos.alias}
                    onChange={cambiarCampo}
                    error={errores.alias}
                    ayuda="Opcional. Es único en SkillMatch y no puede repetirse."
                    maxLength={50}
                    autoComplete="nickname"
                />

                <CampoArea
                    id="perfil-biografia"
                    name="biografia"
                    label="Biografía"
                    value={datos.biografia}
                    onChange={cambiarCampo}
                    error={errores.biografia}
                    ayuda="Cuéntale a la comunidad qué puedes enseñar."
                    maximo={1000}
                    maxLength={1000}
                    rows={4}
                />

                <CampoTexto
                    id="perfil-foto"
                    name="fotoPerfilUrl"
                    label="Foto de perfil (URL)"
                    value={datos.fotoPerfilUrl}
                    onChange={cambiarCampo}
                    error={errores.fotoPerfilUrl}
                    ayuda="Opcional. Debe iniciar con http:// o https://."
                    maxLength={255}
                    placeholder="https://ejemplo.com/foto.png"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <CampoTexto
                        id="perfil-disponibilidad"
                        name="disponibilidad"
                        label="Disponibilidad"
                        value={datos.disponibilidad}
                        onChange={cambiarCampo}
                        error={errores.disponibilidad}
                        maxLength={100}
                        placeholder="Tardes y fines de semana"
                    />

                    <CampoTexto
                        id="perfil-ciudad"
                        name="ciudad"
                        label="Ciudad"
                        value={datos.ciudad}
                        onChange={cambiarCampo}
                        error={errores.ciudad}
                        maxLength={80}
                        autoComplete="address-level2"
                    />

                    <CampoTexto
                        id="perfil-pais"
                        name="pais"
                        label="País"
                        value={datos.pais}
                        onChange={cambiarCampo}
                        error={errores.pais}
                        maxLength={80}
                        autoComplete="country-name"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
            </fieldset>
        </form>
    );
}
