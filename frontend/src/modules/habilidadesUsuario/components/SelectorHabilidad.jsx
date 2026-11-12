import { useState } from 'react';

import CampoSelect from '../../../components/CampoSelect.jsx';

/**
 * Selector del catálogo de habilidades con búsqueda por nombre.
 * El catálogo lo carga la página; aquí solo se pide un nuevo filtro.
 */
export default function SelectorHabilidad({
    id,
    label,
    habilidades = [],
    valor,
    onCambio,
    onBuscar,
    buscando = false,
    error,
    ayuda
}) {
    const [texto, setTexto] = useState('');

    function buscar() {
        if (buscando) {
            return;
        }

        onBuscar(texto.trim());
    }

    return (
        <div>
            <CampoSelect
                id={id}
                name="idHabilidad"
                label={label}
                value={valor}
                onChange={onCambio}
                error={error}
                ayuda={ayuda}
                placeholder="Selecciona una habilidad"
                opciones={habilidades.map((habilidad) => ({
                    valor: String(habilidad.id_habilidad),
                    etiqueta: `${habilidad.nombre} · ${habilidad.categoria}`
                }))}
            />

            <div className="mt-2 flex gap-2">
                <input
                    type="text"
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    placeholder="Buscar en el catálogo"
                    aria-label="Buscar habilidad en el catálogo"
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-700 bg-surface-alt px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                    type="button"
                    onClick={buscar}
                    disabled={buscando}
                    className="whitespace-nowrap rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-text-main transition hover:bg-slate-800 disabled:opacity-60"
                >
                    {buscando ? 'Buscando…' : 'Buscar'}
                </button>
            </div>

            <p className="mt-1 text-xs text-text-muted">
                Se muestran hasta 50 habilidades activas del catálogo.
            </p>
        </div>
    );
}
