import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from './authContexto.js';
import { iniciarSesion as iniciarSesionApi } from './api/authApi.js';
import {
    CLAVE_SESION,
    EVENTO_SESION_EXPIRADA,
    actualizarUsuarioSesion,
    borrarSesion,
    guardarSesion,
    obtenerSesion
} from '../../services/sesion.js';
import { reconectarEventos } from '../../services/eventosCliente.js';

// Proveedor de autenticación.
// Guarda la sesión vigente y expone las acciones que usan las pantallas.
export function AuthProvider({ children }) {
    // La sesión se lee de localStorage en el primer render: no hay parpadeo
    // entre "sin sesión" y la pantalla privada.
    const [sesion, setSesion] = useState(() => obtenerSesion());
    const [expirada, setExpirada] = useState(false);

    useEffect(() => {
        function alExpirar() {
            setSesion(null);
            setExpirada(true);
        }

        // Sincroniza la sesión entre pestañas del mismo navegador.
        function alCambiarAlmacen(evento) {
            if (evento.key !== null && evento.key !== CLAVE_SESION) {
                return;
            }

            setSesion(obtenerSesion());
            setExpirada(false);
        }

        window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
        window.addEventListener('storage', alCambiarAlmacen);

        return () => {
            window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
            window.removeEventListener('storage', alCambiarAlmacen);
        };
    }, []);

    // Inicia sesión contra el backend y persiste el token.
    const iniciarSesion = useCallback(async (credenciales) => {
        const resultado = await iniciarSesionApi(credenciales);
        const nuevaSesion = guardarSesion(resultado.data);

        setSesion(nuevaSesion);
        setExpirada(false);

        // Si otra cuenta estaba conectada, el flujo SSE se reabre con el token
        // nuevo.
        reconectarEventos();

        return nuevaSesion.usuario;
    }, []);

    // Cierra la sesión por decisión del usuario.
    const cerrarSesion = useCallback(() => {
        borrarSesion();
        setSesion(null);
        setExpirada(false);
    }, []);

    // Refresca los datos del usuario sin tocar el token (por ejemplo después de
    // editar el perfil).
    const actualizarUsuario = useCallback((usuario) => {
        const actualizada = actualizarUsuarioSesion(usuario);

        if (actualizada) {
            setSesion(actualizada);
        }
    }, []);

    const value = useMemo(
        () => ({
            usuario: sesion?.usuario ?? null,
            token: sesion?.token ?? null,
            autenticado: Boolean(sesion?.token),
            esAdministrador: sesion?.usuario?.rol === 'administrador',
            expirada,
            iniciarSesion,
            cerrarSesion,
            actualizarUsuario
        }),
        [sesion, expirada, iniciarSesion, cerrarSesion, actualizarUsuario]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
