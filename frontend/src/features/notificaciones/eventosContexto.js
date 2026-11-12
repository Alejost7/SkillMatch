import { createContext } from 'react';

// Contexto de notificaciones separado del proveedor para que el archivo del
// proveedor solo exporte componentes (regla react-refresh).
export const EventosContext = createContext(null);
