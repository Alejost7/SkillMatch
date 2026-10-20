import { apiClient } from '../../services/apiClient.js';

export async function listarCategorias({ signal } = {}) {
    const result = await apiClient('/categorias', { signal });

    return result.data;
}

export async function crearCategoria(datos) {
    const result = await apiClient('/categorias', { 
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return result.data;
}

export async function actualizarCategoria(idCategoria, datos) {
    const result = await apiClient(`/categorias/${idCategoria}`, {
        method: 'PUT',
        body: JSON.stringify(datos)
    });

    return result.data;
}

export async function eliminarCategoria(idCategoria) {
    const result = await apiClient(`/categorias/${idCategoria}`, {
        method: 'DELETE'
    }); 

    return result;
}