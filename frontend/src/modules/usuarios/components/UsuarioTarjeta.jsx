import { Link } from 'react-router-dom';

import {
    formatearPromedio,
    iniciales,
    nombreCompleto
} from '../../../utils/formato.js';
import HabilidadesResumen from './HabilidadesResumen.jsx';

/**
 * Tarjeta de un usuario en el buscador.
 * Muestra datos públicos: nunca incluye correo ni estado de la cuenta.
 */
export default function UsuarioTarjeta({ usuario }) {
    const ubicacion = [usuario.perfil?.ciudad, usuario.perfil?.pais]
        .filter(Boolean)
        .join(', ');

    const calificacion = usuario.calificacion;

    return (
        <article className="flex h-full flex-col rounded-2xl border border-slate-800 bg-surface p-5 transition hover:border-primary">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {iniciales(usuario)}
                </span>

                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-text-main">
                        {nombreCompleto(usuario)}
                    </h2>

                    <p className="truncate text-xs text-text-muted">
                        {usuario.alias ? `@${usuario.alias}` : 'Sin alias'}
                        {ubicacion ? ` · ${ubicacion}` : ''}
                    </p>

                    <p className="mt-1 text-xs text-accent">
                        {calificacion?.total
                            ? `★ ${formatearPromedio(calificacion.promedio, calificacion.total)} (${calificacion.total})`
                            : 'Sin calificaciones todavía'}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex-1">
                <HabilidadesResumen habilidades={usuario.habilidades} limite={3} />
            </div>

            <Link
                to={`/app/usuarios/${usuario.idUsuario}`}
                className="mt-4 rounded-lg border border-primary px-4 py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/10"
            >
                Ver perfil
            </Link>
        </article>
    );
}
