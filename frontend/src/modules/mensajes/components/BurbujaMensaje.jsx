import { formatearHora, nombreCompleto } from '../../../utils/formato.js';

/**
 * Burbuja de un mensaje del chat.
 * Los propios se alinean a la derecha; los recibidos, a la izquierda.
 */
export default function BurbujaMensaje({ mensaje }) {
    const propio = mensaje.esPropio;

    return (
        <div
            className={`flex ${propio ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:max-w-[70%] ${
                    propio
                        ? 'rounded-br-sm bg-primary text-slate-950'
                        : 'rounded-bl-sm bg-surface-alt text-text-main'
                }`}
            >
                {!propio && (
                    <p
                        className={`text-xs font-semibold ${
                            propio ? 'text-slate-900/80' : 'text-primary'
                        }`}
                    >
                        {nombreCompleto(mensaje.remitente)}
                    </p>
                )}

                <p className="mt-1 whitespace-pre-wrap break-words">
                    {mensaje.contenido}
                </p>

                <p
                    className={`mt-1 text-right text-[11px] ${
                        propio ? 'text-slate-900/70' : 'text-text-muted'
                    }`}
                >
                    {formatearHora(mensaje.fechaEnvio)}
                    {propio && (mensaje.leido ? ' · Leído' : ' · Enviado')}
                </p>
            </div>
        </div>
    );
}
