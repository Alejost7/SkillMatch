import { apiClient } from '../../../services/apiClient';

export function registrarUsuario(payload) {
    return apiClient('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function iniciarSesion(credenciales) {
    return apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credenciales),
    });
}

// Futuras rutas de auth:
// export function cerrarSesion() { return apiClient('/auth/logout', { method: 'POST' }); }
// export function refrescarToken() { return apiClient('/auth/refresh', { method: 'POST' }); }