import { useState } from 'react';

import { MAX_CONTENIDO, validarMensaje } from '../mensajes.validation.js';

/**
 * Caja de escritura del chat.
 * Enter envía y Shift+Enter agrega un salto de línea.
 */
export default function FormularioMensaje({
    onEnviar,
    enviando = false,
    deshabilitado = false
}) {
    const [contenido, setContenido] = useState('');
    const [error, setError] = useState('');

    async function enviar(evento) {
        evento?.preventDefault();

        if (enviando || deshabilitado) {
            return;
        }

        const errores = validarMensaje({ contenido });

        if (errores.contenido) {
            setError(errores.contenido);
            return;
        }

        setError('');

        const enviado = await onEnviar(contenido.trim());

        if (enviado) {
            setContenido('');
        }
    }

    function alPulsarTecla(evento) {
        if (evento.key === 'Enter' && !evento.shiftKey) {
            evento.preventDefault();
            void enviar();
        }
    }

    return (
        <form onSubmit={enviar} className="mt-4">
            <label htmlFor="mensaje-contenido" className="sr-only">
                Mensaje
            </label>

            <textarea
                id="mensaje-contenido"
                rows={2}
                value={contenido}
                onChange={(evento) => {
                    setContenido(evento.target.value);
                    setError('');
                }}
                onKeyDown={alPulsarTecla}
                disabled={enviando || deshabilitado}
                maxLength={MAX_CONTENIDO}
                placeholder={
                    deshabilitado
                        ? 'La conversación no está activa.'
                        : 'Escribe un mensaje…'
                }
                className="w-full rounded-xl border border-slate-700 bg-surface-alt px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-text-muted">
                    {error ? (
                        <span className="text-danger">{error}</span>
                    ) : (
                        `${[...contenido].length}/${MAX_CONTENIDO} caracteres · Enter para enviar`
                    )}
                </p>

                <button
                    type="submit"
                    disabled={enviando || deshabilitado}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {enviando ? 'Enviando…' : 'Enviar'}
                </button>
            </div>
        </form>
    );
}
