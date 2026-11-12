import { apiClient } from '../../services/apiClient.js';

// Habilidades que el usuario ofrece (lo que puede enseñar).
export async function listarOfrecidas({ signal } = {}) {
    const resultado = await apiClient('/habilidades-usuario/ofrecidas', {
        signal
    });

    return resultado.data;
}

export async function crearOfrecida(datos) {
    const resultado = await apiClient('/habilidades-usuario/ofrecidas', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

export async function actualizarOfrecida(idHabilidadOfrecida, datos) {
    const resultado = await apiClient(
        `/habilidades-usuario/ofrecidas/${idHabilidadOfrecida}`,
        {
            method: 'PUT',
            body: JSON.stringify(datos)
        }
    );

    return resultado.data;
}

export async function eliminarOfrecida(idHabilidadOfrecida) {
    const resultado = await apiClient(
        `/habilidades-usuario/ofrecidas/${idHabilidadOfrecida}`,
        { method: 'DELETE' }
    );

    return resultado;
}

// Habilidades que el usuario quiere aprender.
export async function listarRequeridas({ signal } = {}) {
    const resultado = await apiClient('/habilidades-usuario/requeridas', {
        signal
    });

    return resultado.data;
}

export async function crearRequerida(datos) {
    const resultado = await apiClient('/habilidades-usuario/requeridas', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

export async function actualizarRequerida(idHabilidadRequerida, datos) {
    const resultado = await apiClient(
        `/habilidades-usuario/requeridas/${idHabilidadRequerida}`,
        {
            method: 'PUT',
            body: JSON.stringify(datos)
        }
    );

    return resultado.data;
}

export async function eliminarRequerida(idHabilidadRequerida) {
    const resultado = await apiClient(
        `/habilidades-usuario/requeridas/${idHabilidadRequerida}`,
        { method: 'DELETE' }
    );

    return resultado;
}
