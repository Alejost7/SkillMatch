import CampoSelect from '../../../components/CampoSelect.jsx';
import CampoTexto from '../../../components/CampoTexto.jsx';

const OPCIONES_ESTADO = [
    { valor: 'activo', etiqueta: 'Activo' },
    { valor: 'inactivo', etiqueta: 'Inactivo' }
];

const OPCIONES_ORDEN = [
    { valor: 'nombre', etiqueta: 'Nombre (A-Z)' },
    { valor: 'recientes', etiqueta: 'Más recientes' }
];

/**
 * Filtros del catálogo de habilidades.
 * Los valores viven en la página para poder limpiarlos de una vez.
 */
export default function HabilidadesFiltros({
    valores,
    categorias = [],
    onCambiar,
    onAplicar,
    onLimpiar,
    cargando = false
}) {
    return (
        <form
            onSubmit={onAplicar}
            className="rounded-2xl border border-slate-800 bg-surface p-4"
            noValidate
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CampoTexto
                    id="filtro-nombre"
                    name="nombre"
                    label="Nombre"
                    value={valores.nombre}
                    onChange={onCambiar}
                    maxLength={100}
                    placeholder="Buscar habilidad"
                />

                <CampoSelect
                    id="filtro-categoria"
                    name="categoriaId"
                    label="Categoría"
                    value={valores.categoriaId}
                    onChange={onCambiar}
                    placeholder="Todas"
                    opciones={categorias.map((categoria) => ({
                        valor: String(categoria.id_categoria),
                        etiqueta: categoria.nombre
                    }))}
                />

                <CampoSelect
                    id="filtro-estado"
                    name="estado"
                    label="Estado"
                    value={valores.estado}
                    onChange={onCambiar}
                    placeholder="Todos"
                    opciones={OPCIONES_ESTADO}
                />

                <CampoSelect
                    id="filtro-orden"
                    name="orden"
                    label="Orden"
                    value={valores.orden}
                    onChange={onCambiar}
                    opciones={OPCIONES_ORDEN}
                />
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={cargando}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Buscar
                </button>

                <button
                    type="button"
                    onClick={onLimpiar}
                    disabled={cargando}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800 disabled:opacity-60"
                >
                    Limpiar filtros
                </button>
            </div>
        </form>
    );
}
