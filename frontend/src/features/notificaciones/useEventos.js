import { useContext } from 'react';

import { EventosContext } from './eventosContexto.js';

// Hook de acceso a las notificaciones en tiempo real.
export function useEventos() {
    const contexto = useContext(EventosContext);

    if (!contexto) {
        throw new Error(
            'useEventos debe usarse dentro de un EventosProvider. Revisa App.jsx.'
        );
    }

    return contexto;
}
