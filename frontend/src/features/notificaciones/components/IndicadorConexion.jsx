import { useEventos } from '../useEventos.js';

// Texto y color del indicador según el estado del flujo SSE.
const ESTADOS = {
    conectado: {
        etiqueta: 'Tiempo real',
        punto: 'bg-success',
        texto: 'text-success'
    },
    conectando: {
        etiqueta: 'Conectando…',
        punto: 'bg-primary animate-pulse',
        texto: 'text-primary'
    },
    reconectando: {
        etiqueta: 'Reconectando…',
        punto: 'bg-warning animate-pulse',
        texto: 'text-warning'
    },
    'sin-sesion': {
        etiqueta: 'Sin sesión',
        punto: 'bg-slate-500',
        texto: 'text-text-muted'
    },
    desconectado: {
        etiqueta: 'Sin tiempo real',
        punto: 'bg-slate-500',
        texto: 'text-text-muted'
    }
};

/**
 * Estado visible del canal de notificaciones.
 * Sirve para que el usuario sepa si los avisos llegan en vivo o si la
 * aplicación está usando el refresco periódico del feed.
 */
export default function IndicadorConexion() {
    const { modoConexion } = useEventos();

    const estado = ESTADOS[modoConexion] ?? ESTADOS.desconectado;

    return (
        <span
            title={`Canal de notificaciones: ${estado.etiqueta}`}
            className={`hidden items-center gap-2 rounded-full border border-slate-700 bg-surface px-3 py-1 text-xs font-medium sm:flex ${estado.texto}`}
        >
            <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${estado.punto}`}
            />
            {estado.etiqueta}
        </span>
    );
}
