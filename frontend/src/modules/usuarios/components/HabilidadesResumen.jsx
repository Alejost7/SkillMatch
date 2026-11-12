import { etiquetaNivel } from '../../../utils/formato.js';

// Cantidad de habilidades que se muestran como etiquetas.
const LIMITE_POR_DEFECTO = 6;

function Etiqueta({ children, tono }) {
    return (
        <span
            className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-3 py-1 text-xs font-medium ${tono}`}
        >
            {children}
        </span>
    );
}

/**
 * Resumen de las habilidades de un usuario.
 * "habilidades" tiene la forma { ofrecidas: [], requeridas: [] }.
 */
export default function HabilidadesResumen({
    habilidades,
    limite = LIMITE_POR_DEFECTO
}) {
    const ofrecidas = habilidades?.ofrecidas ?? [];
    const requeridas = habilidades?.requeridas ?? [];

    if (ofrecidas.length === 0 && requeridas.length === 0) {
        return (
            <p className="text-xs text-text-muted">
                Este usuario todavía no registró habilidades.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Ofrece
                </p>

                {ofrecidas.length === 0 ? (
                    <p className="mt-1 text-xs text-text-muted">
                        Sin habilidades ofrecidas.
                    </p>
                ) : (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                        {ofrecidas.slice(0, limite).map((habilidad) => (
                            <li key={habilidad.idHabilidadOfrecida}>
                                <Etiqueta tono="bg-success/15 text-success">
                                    {habilidad.habilidad}
                                    {habilidad.nivel && (
                                        <span className="font-normal text-success/80">
                                            · {etiquetaNivel(habilidad.nivel)}
                                        </span>
                                    )}
                                </Etiqueta>
                            </li>
                        ))}

                        {ofrecidas.length > limite && (
                            <li>
                                <Etiqueta tono="bg-slate-700/40 text-text-muted">
                                    +{ofrecidas.length - limite} más
                                </Etiqueta>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Quiere aprender
                </p>

                {requeridas.length === 0 ? (
                    <p className="mt-1 text-xs text-text-muted">
                        Sin habilidades requeridas.
                    </p>
                ) : (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                        {requeridas.slice(0, limite).map((habilidad) => (
                            <li key={habilidad.idHabilidadRequerida}>
                                <Etiqueta tono="bg-primary/15 text-primary">
                                    {habilidad.habilidad}
                                    {habilidad.nivelDeseado && (
                                        <span className="font-normal text-primary/80">
                                            ·{' '}
                                            {etiquetaNivel(
                                                habilidad.nivelDeseado
                                            )}
                                        </span>
                                    )}
                                </Etiqueta>
                            </li>
                        ))}

                        {requeridas.length > limite && (
                            <li>
                                <Etiqueta tono="bg-slate-700/40 text-text-muted">
                                    +{requeridas.length - limite} más
                                </Etiqueta>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
