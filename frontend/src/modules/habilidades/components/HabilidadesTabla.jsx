import EstadoVacio from '../../../components/EstadoVacio.jsx';

export default function HabilidadesTabla({
    habilidades,
    onEdit,
    onDelete,
    ocupado = false
}) {
    if (habilidades.length === 0) {
        return (
            <EstadoVacio titulo="No hay habilidades para mostrar">
                Ajusta los filtros o registra una nueva habilidad en el
                catálogo.
            </EstadoVacio>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Habilidades registradas en el catálogo de SkillMatch
                </caption>

                <thead className="border-b border-slate-800 bg-surface-alt">
                    <tr>
                        {['Habilidad', 'Categoría', 'Estado', 'Acciones'].map(
                            (titulo) => (
                                <th
                                    key={titulo}
                                    scope="col"
                                    className="px-5 py-4 font-semibold text-text-main"
                                >
                                    {titulo}
                                </th>
                            )
                        )}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                    {habilidades.map((habilidad) => (
                        <tr
                            key={habilidad.id_habilidad}
                            className="transition hover:bg-slate-800/40"
                        >
                            <td className="px-5 py-4">
                                <p className="font-medium text-text-main">
                                    {habilidad.nombre}
                                </p>

                                <p className="mt-1 text-xs text-text-muted">
                                    {habilidad.descripcion || 'Sin descripción'}
                                </p>
                            </td>

                            <td className="px-5 py-4 text-text-muted">
                                {habilidad.categoria}
                            </td>

                            <td className="px-5 py-4">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        habilidad.estado === 'activo'
                                            ? 'bg-success/15 text-success'
                                            : 'bg-slate-700/40 text-text-muted'
                                    }`}
                                >
                                    {habilidad.estado === 'activo'
                                        ? 'Activo'
                                        : 'Inactivo'}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={ocupado}
                                        onClick={() => onEdit(habilidad)}
                                        aria-label={`Editar ${habilidad.nombre}`}
                                        className="rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary transition hover:bg-primary/20 disabled:opacity-50"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        disabled={ocupado}
                                        onClick={() => onDelete(habilidad)}
                                        aria-label={`Eliminar ${habilidad.nombre}`}
                                        className="rounded-lg bg-danger/10 px-3 py-2 font-medium text-danger transition hover:bg-danger/20 disabled:opacity-50"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
