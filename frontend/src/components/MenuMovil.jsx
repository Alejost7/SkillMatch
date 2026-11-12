import { useEffect, useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

// Mismas clases que usan las barras horizontales de los layouts, para que el
// aspecto del enlace activo no cambie entre escritorio y móvil.
function claseEnlace({ isActive }) {
    const base = 'block rounded-lg px-3 py-2 text-sm font-medium transition';

    return isActive
        ? `${base} bg-primary/15 text-primary`
        : `${base} text-text-muted hover:bg-slate-800 hover:text-text-main`;
}

/**
 * Menú de hamburguesa para pantallas pequeñas.
 *
 * En escritorio (md en adelante) se oculta por completo: los layouts muestran
 * su barra horizontal de siempre. En móvil guarda los mismos enlaces en un
 * panel desplegable que se cierra al elegir un enlace, al tocar fuera o al
 * pulsar Escape.
 */
export default function MenuMovil({ enlaces, ariaLabel = 'Navegación principal' }) {
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);
    const botonRef = useRef(null);
    const idPanel = useId();

    useEffect(() => {
        if (!abierto) {
            return undefined;
        }

        function alPresionarFuera(evento) {
            if (
                contenedorRef.current &&
                !contenedorRef.current.contains(evento.target)
            ) {
                setAbierto(false);
            }
        }

        function alPulsarTecla(evento) {
            if (evento.key === 'Escape') {
                setAbierto(false);
                // Devolvemos el foco al botón para no perder la posición.
                botonRef.current?.focus();
            }
        }

        document.addEventListener('mousedown', alPresionarFuera);
        document.addEventListener('keydown', alPulsarTecla);

        return () => {
            document.removeEventListener('mousedown', alPresionarFuera);
            document.removeEventListener('keydown', alPulsarTecla);
        };
    }, [abierto]);

    return (
        <div ref={contenedorRef} className="relative md:hidden">
            <button
                ref={botonRef}
                type="button"
                onClick={() => setAbierto((valor) => !valor)}
                aria-expanded={abierto}
                aria-haspopup="true"
                aria-controls={idPanel}
                className="rounded-lg border border-slate-700 p-2 text-text-muted transition hover:border-primary hover:text-primary"
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                >
                    {abierto ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M18 6L6 18"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 7h16M4 12h16M4 17h16"
                        />
                    )}
                </svg>

                <span className="sr-only">
                    {abierto ? 'Cerrar menú' : 'Abrir menú'}
                </span>
            </button>

            {abierto && (
                <nav
                    id={idPanel}
                    aria-label={ariaLabel}
                    className="absolute right-0 z-50 mt-2 flex w-56 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-2xl border border-slate-800 bg-surface p-2 shadow-2xl"
                >
                    {enlaces.map((enlace) => (
                        <NavLink
                            key={enlace.destino}
                            to={enlace.destino}
                            end={enlace.exacto}
                            className={claseEnlace}
                            onClick={() => setAbierto(false)}
                        >
                            {enlace.texto}
                        </NavLink>
                    ))}
                </nav>
            )}
        </div>
    );
}
