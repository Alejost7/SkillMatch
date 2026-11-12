import { useState } from 'react';

import AlertMessage from '../../../components/AlertMessage.jsx';
import CampoArea from '../../../components/CampoArea.jsx';
import { useEventos } from '../../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../../utils/errores.js';

import { crearSolicitud } from '../solicitudes.api.js';
import { validarSolicitud } from '../solicitudes.validation.js';

/**
 * Formulario para enviar una solicitud de conexión desde el perfil público.
 * El mensaje inicial es opcional (máximo 500 caracteres).
 */
export default function FormularioSolicitud({ idUsuarioReceptor }) {
    const { recargarFeed } = useEventos();

    const [mensajeInicial, setMensajeInicial] = useState('');
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState('');
    const [exito, setExito] = useState('');

    async function enviarSolicitud(evento) {
        evento.preventDefault();

        if (enviando) {
            return;
        }

        setErrorEnvio('');
        setExito('');

        const nuevosErrores = validarSolicitud({ mensajeInicial });

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        setEnviando(true);

        try {
            const solicitud = await crearSolicitud({
                idUsuarioReceptor: Number(idUsuarioReceptor),
                mensajeInicial: mensajeInicial.trim() || undefined
            });

            setMensajeInicial('');
            setExito(
                solicitud?.estado === 'pendiente'
                    ? 'Solicitud enviada. Te avisaremos cuando la respondan.'
                    : 'Solicitud enviada correctamente.'
            );

            // El contador de solicitudes enviadas no aparece en el feed, pero el
            // resumen se actualiza para reflejar cualquier cambio.
            void recargarFeed();
        } catch (error) {
            setErrorEnvio(mensajeDeError(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section className="rounded-2xl border border-slate-800 bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-main">
                Enviar solicitud de conexión
            </h2>

            <p className="mt-1 text-sm text-text-muted">
                Cuéntale por qué quieres conectar. No puedes tener dos
                solicitudes pendientes con la misma persona.
            </p>

            <div className="mt-4 space-y-3">
                {exito && <AlertMessage type="success">{exito}</AlertMessage>}

                {errorEnvio && <AlertMessage>{errorEnvio}</AlertMessage>}
            </div>

            <form onSubmit={enviarSolicitud} noValidate className="mt-4">
                <fieldset disabled={enviando} className="space-y-3">
                    <CampoArea
                        id="solicitud-mensaje"
                        name="mensajeInicial"
                        label="Mensaje inicial"
                        value={mensajeInicial}
                        onChange={(evento) => {
                            setMensajeInicial(evento.target.value);
                            setErrores({ mensajeInicial: '' });
                        }}
                        error={errores.mensajeInicial}
                        ayuda="Opcional."
                        maximo={500}
                        maxLength={500}
                        rows={3}
                        placeholder="Hola, vi que ofreces JavaScript y yo puedo ayudarte con diseño…"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {enviando ? 'Enviando…' : 'Enviar solicitud'}
                    </button>
                </fieldset>
            </form>
        </section>
    );
}
