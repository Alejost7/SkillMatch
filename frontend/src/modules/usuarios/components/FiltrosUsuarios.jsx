import CampoTexto from '../../../components/CampoTexto.jsx';

/**
 * Filtros del buscador de usuarios.
 * Todos los textos son opcionales y usan coincidencia parcial.
 */
export default function FiltrosUsuarios({
    valores,
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <CampoTexto
                    id="filtro-nombre"
                    name="nombre"
                    label="Nombre o alias"
                    value={valores.nombre}
                    onChange={onCambiar}
                    maxLength={100}
                    placeholder="Ejemplo: Ana"
                />

                <CampoTexto
                    id="filtro-ciudad"
                    name="ciudad"
                    label="Ciudad"
                    value={valores.ciudad}
                    onChange={onCambiar}
                    maxLength={80}
                    placeholder="Ejemplo: Bogotá"
                />

                <CampoTexto
                    id="filtro-pais"
                    name="pais"
                    label="País"
                    value={valores.pais}
                    onChange={onCambiar}
                    maxLength={80}
                    placeholder="Ejemplo: Colombia"
                />

                <CampoTexto
                    id="filtro-ofrecida"
                    name="habilidadOfrecida"
                    label="Ofrece la habilidad"
                    value={valores.habilidadOfrecida}
                    onChange={onCambiar}
                    maxLength={100}
                    placeholder="Ejemplo: JavaScript"
                />

                <CampoTexto
                    id="filtro-requerida"
                    name="habilidadRequerida"
                    label="Quiere aprender"
                    value={valores.habilidadRequerida}
                    onChange={onCambiar}
                    maxLength={100}
                    placeholder="Ejemplo: Guitarra"
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
