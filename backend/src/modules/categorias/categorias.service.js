import * as categoriasRepository from './categorias.repository.js';

function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

export async function listarCategorias() {
    return categoriasRepository.findAll();
    }

    export async function obtenerCategoria(id) {
    const categoria = await categoriasRepository.findById(id);

    if (!categoria) {
        throw crearError(404, 'Ups! Parece que la categoría no existe.');
    }

    return categoria;
}

export async function crearCategoria(datos) {
    try {
        return await categoriasRepository.create(datos);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
        throw crearError(
            409,
            'Cuidadooo!! Ya existe una categoría con ese nombre.'
        );
        }

        throw error;
    }
}

export async function actualizarCategoria(id, datos) {
    try {
        const categoria = await categoriasRepository.update(id, datos);

        if (!categoria) {
        throw crearError(404, 'La categoría no existe :(.');
        }

        return categoria;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
        throw crearError(
            409,
            'Ya existe una categoría con ese nombre, intenta con otroooo.'
        );
        }

        throw error;
    }
}

export async function eliminarCategoria(id) {
    try {
        const eliminada = await categoriasRepository.remove(id);

        if (!eliminada) {
        throw crearError(404, 'La categoría nooooo existe.');
        }
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw crearError(
            409,
            'OJO! No puedes eliminar esta categoría porque tiene habilidades asociadas.'
        );
        }

        throw error;
    }
}