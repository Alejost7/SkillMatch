export default function CategoriasTable({
    categorias,
    onEdit,
    onDelete,
    ocupado = false
    }) {
    if (categorias.length === 0) {
        return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h2 className="font-semibold text-slate-800">
            No hay categorías para mostrar
            </h2>

            <p className="mt-2 text-sm text-slate-500">
            Las categorías registradas aparecerán aquí.
            </p>
        </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
            <caption className="sr-only">
            Categorías de conocimiento registradas en SkillMatch
            </caption>

            <thead className="border-b border-slate-200 bg-slate-100">
            <tr>
                {['Nombre', 'Descripción', 'Estado', 'Acciones'].map(
                (titulo) => (
                    <th
                    key={titulo}
                    scope="col"
                    className="px-5 py-4 font-semibold"
                    >
                    {titulo}
                    </th>
                )
                )}
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {categorias.map((categoria) => (
                <tr
                key={categoria.id_categoria}
                className="hover:bg-slate-50"
                >
                <td className="px-5 py-4 font-medium text-slate-900">
                    {categoria.nombre}
                </td>

                <td className="min-w-48 px-5 py-4 text-slate-600">
                    {categoria.descripcion || 'Sin descripción'}
                </td>

                <td className="px-5 py-4">
                    <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        categoria.estado === 'activo'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
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
                        className="rounded-lg bg-indigo-50 px-3 py-2 font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        disabled={ocupado}
                        onClick={() => onDelete(categoria)}
                        aria-label={`Eliminar ${categoria.nombre}`}
                        className="rounded-lg bg-red-50 px-3 py-2 font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
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