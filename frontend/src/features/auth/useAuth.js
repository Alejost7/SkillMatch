import { useContext } from 'react';

import { AuthContext } from './authContexto.js';

// Hook de acceso al contexto. Falla con un mensaje claro si se usa fuera del
// proveedor, para detectar el error durante el desarrollo.
export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error(
            'useAuth debe usarse dentro de un AuthProvider. Revisa App.jsx.'
        );
    }

    return contexto;
}
