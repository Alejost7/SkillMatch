import EstadoVacio from '../../../components/EstadoVacio.jsx';
import { etiquetaEstado, etiquetaNivel } from '../../../utils/formato.js';

// Configuración de los dos tipos de habilidad del usuario.
const CONFIGURACION = {
    ofrecidas: {
        campoId: 'idHabilidadOfrecida',
        campoNivel: 'nivel',
        campoTexto: 'descripcionApoyo',
        tituloTexto: 'Cómo puedes ayudar',
        vacio: 'Todavía no has publicado habilidades que puedas enseñar.'
    },
    requeridas: {
        campoId: 'idHabilidadRequerida',
        campoNivel: 'nivelDeseado',
        campoTexto: 'objetivoAprendizaje',
        tituloTexto: 'Objetivo de aprendizaje',
        vacio: 'Todavía no has indicado qué te gustaría aprender.'
    }
};

/**
 * Lista de habilidades del usuario (ofrecidas o requeridas).
 */
export default function ListaHabilidades({
    tipo,
    items = [],
    onEditar,
    onEliminar,
    ocupado = false
}) {
    const configuracion = CONFIGURACION[tipo];

    if (items.length === 0) {
        return <EstadoVacio titulo={configuracion.vacio} />;
    }

    return (
        <ul className="space-y-3">
            {items.map((item) => {
                const identificador = item[configuracion.campoId];
                const descripcion = item[configuracion.campoTexto];

                return (
                    <li
                        key={identificador}
                        className="rounded-2xl border border-slate-800 bg-surface p-4"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-semibold text-text-main">
                                    {item.habilidad}
                                </h3>

                                <p className="mt-0.5 text-xs text-text-muted">
                                    {item.categoria} ·{' '}
                                    {etiquetaNivel(item[configuracion.campoNivel])}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    item.estado === 'activo'
                                        ? 'bg-success/15 text-success'
                                        : 'bg-slate-700/40 text-text-muted'
                                }`}
                            >
                                {etiquetaEstado(item.estado)}
                            </span>
                        </div>

                        {descripcion && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    {configuracion.tituloTexto}
                                </p>

                                <p className="mt-1 text-sm text-text-main">
                                    {descripcion}
                                </p>
                            </div>
                        )}

                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                disabled={ocupado}
                                onClick={() => onEditar(item)}
                                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 disabled:opacity-50"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                disabled={ocupado}
                                onClick={() => onEliminar(item)}
                                className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/20 disabled:opacity-50"
                            >
                                Quitar
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
