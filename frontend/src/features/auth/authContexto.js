import { createContext } from 'react';

// Contexto de autenticación separado del proveedor para que el archivo del
// proveedor solo exporte componentes (regla react-refresh).
export const AuthContext = createContext(null);
