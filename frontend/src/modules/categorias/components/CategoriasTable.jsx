import EstadoVacio from '../../../components/EstadoVacio.jsx';

export default function CategoriasTable({
    categorias,
    onEdit,
    onDelete,
    ocupado = false
}) {
    if (categorias.length === 0) {
        return (
            <EstadoVacio titulo="No hay categorías para mostrar">
                Las categorías registradas aparecerán aquí.
            </EstadoVacio>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Categorías de conocimiento registradas en SkillMatch
                </caption>

                <thead className="border-b border-slate-800 bg-surface-alt">
                    <tr>
                        {['Nombre', 'Descripción', 'Estado', 'Acciones'].map(
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
                    {categorias.map((categoria) => (
                        <tr
                            key={categoria.id_categoria}
                            className="transition hover:bg-slate-800/40"
                        >
                            <td className="px-5 py-4 font-medium text-text-main">
                                {categoria.nombre}
                            </td>

                            <td className="min-w-48 px-5 py-4 text-text-muted">
                                {categoria.descripcion || 'Sin descripción'}
                            </td>

                            <td className="px-5 py-4">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        categoria.estado === 'activo'
                                            ? 'bg-success/15 text-success'
                                            : 'bg-slate-700/40 text-text-muted'
                                    }`}
                                >
                                    {categoria.estado === 'activo'
                                        ? 'Activo'
                                        : 'Inactivo'}
                                </span>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={ocupado}
                                        onClick={() => onEdit(categoria)}
                                        aria-label={`Editar ${categoria.nombre}`}
                                        className="rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary transition hover:bg-primary/20 disabled:opacity-50"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        disabled={ocupado}
                                        onClick={() => onDelete(categoria)}
                                        aria-label={`Eliminar ${categoria.nombre}`}
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
