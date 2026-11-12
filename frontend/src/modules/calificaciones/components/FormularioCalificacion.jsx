import { useState } from 'react';

import AlertMessage from '../../../components/AlertMessage.jsx';
import CampoArea from '../../../components/CampoArea.jsx';
import { useEventos } from '../../../features/notificaciones/useEventos.js';
import { mensajeDeError } from '../../../utils/errores.js';
import { nombreCompleto } from '../../../utils/formato.js';

import { crearCalificacion } from '../calificaciones.api.js';
import { ETIQUETAS_PUNTUACION, validarCalificacion } from '../calificaciones.validation.js';

const VALORES = [1, 2, 3, 4, 5];

/**
 * Formulario para calificar un intercambio finalizado.
 * El calificado lo deduce el backend de la conexión.
 */
export default function FormularioCalificacion({
    idConexion,
    interlocutor,
    onCalificada
}) {
    const { recargarFeed } = useEventos();

    const [puntuacion, setPuntuacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState('');

    async function enviarCalificacion(evento) {
        evento.preventDefault();

        if (guardando) {
            return;
        }

        const nuevosErrores = validarCalificacion({ puntuacion, comentario });

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        setGuardando(true);
        setErrorEnvio('');

        try {
            await crearCalificacion({
                idConexion: Number(idConexion),
                puntuacion: Number(puntuacion),
                comentario: comentario.trim() || null
            });

            void recargarFeed();
            onCalificada?.();
        } catch (error) {
            setErrorEnvio(mensajeDeError(error));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <form
            onSubmit={enviarCalificacion}
            noValidate
            className="rounded-2xl border border-slate-800 bg-surface p-5"
        >
            <h3 className="font-semibold text-text-main">
                Califica tu intercambio con {nombreCompleto(interlocutor)}
            </h3>

            {errorEnvio && (
                <div className="mt-3">
                    <AlertMessage>{errorEnvio}</AlertMessage>
                </div>
            )}

            <fieldset disabled={guardando} className="mt-4 space-y-4">
                <legend className="text-sm font-medium text-text-main">
                    Puntuación *
                </legend>

                <div className="flex items-center gap-1">
                    <div role="group" aria-label="Puntuación de 1 a 5">
                        {VALORES.map((valor) => (
                            <button
                                key={valor}
                                type="button"
                                aria-pressed={puntuacion === valor}
                                onClick={() => {
                                    setPuntuacion(valor);
                                    setErrores((actuales) => ({
                                        ...actuales,
                                        puntuacion: ''
                                    }));
                                }}
                                className={`rounded px-1 text-2xl transition ${
                                    puntuacion >= valor
                                        ? 'text-accent'
                                        : 'text-slate-600 hover:text-accent/70'
                                }`}
                            >
                                ★<span className="sr-only">{valor} de 5</span>
                            </button>
                        ))}
                    </div>

                    <span className="ml-2 text-xs text-text-muted">
                        {puntuacion
                            ? ETIQUETAS_PUNTUACION[puntuacion]
                            : 'Selecciona una puntuación'}
                    </span>
                </div>

                {errores.puntuacion && (
                    <p role="alert" className="text-sm text-danger">
                        {errores.puntuacion}
                    </p>
                )}

                <CampoArea
                    id={`calificacion-comentario-${idConexion}`}
                    name="comentario"
                    label="Comentario"
                    valor={comentario}
                    onChange={(evento) => {
                        setComentario(evento.target.value);
                        setErrores((actuales) => ({
                            ...actuales,
                            comentario: ''
                        }));
                    }}
                    error={errores.comentario}
                    ayuda="Opcional. Cuenta cómo fue la experiencia."
                    maximo={500}
                    maxLength={500}
                    rows={3}
                />

                <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {guardando ? 'Enviando…' : 'Enviar calificación'}
                </button>
            </fieldset>
        </form>
    );
}
