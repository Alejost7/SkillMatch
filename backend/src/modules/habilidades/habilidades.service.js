// Servicio del módulo de habilidades.
// Contiene las reglas de negocio y delega las consultas al repositorio.

import * as habilidadesRepository from './habilidades.repository.js';
import * as categoriasRepository from '../categorias/categorias.repository.js';
import { construirPaginacion } from '../../utils/consulta.js';

// Crea un error con un código HTTP asociado.
function crearError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Lista las habilidades que cumplen los filtros, con su paginación.
// filtros puede incluir idCategoria, nombre, estado y orden.
export async function listarHabilidades({
    filtros,
    pagina,
    limite,
    desplazamiento
}) {
    const total = await habilidadesRepository.contar(filtros);

    // Si no hay resultados evitamos la consulta del listado.
    const habilidades =
        total === 0
            ? []
            : await habilidadesRepository.buscar(filtros, {
                  limite,
                  desplazamiento,
                  orden: filtros.orden
              });

    return {
        habilidades,
        paginacion: construirPaginacion({ total, pagina, limite })
    };
}

// Obtiene una habilidad por su identificador.
export async function obtenerHabilidad(id) {
    const habilidad = await habilidadesRepository.findById(id);

    if (!habilidad) {
        throw crearError(404, 'La habilidad no existe.');
    }

    return habilidad;
}

// Crea una nueva habilidad.
export async function crearHabilidad(datos) {
    // Verificamos que la categoría asociada exista.
    const categoria = await categoriasRepository.findById(datos.idCategoria);

    if (!categoria) {
        throw crearError(404, 'La categoría indicada no existe.');
    }

    try {
        return await habilidadesRepository.create(datos);
    } catch (error) {
        // MySQL devuelve este código cuando se viola una restricción UNIQUE.
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(
                409,
                'Ya existe una habilidad con ese nombre en la categoría indicada.'
            );
        }

        throw error;
    }
}

// Actualiza una habilidad existente.
export async function actualizarHabilidad(id, datos) {
    // Verificamos que la habilidad exista.
    const habilidadExistente = await habilidadesRepository.findById(id);

    if (!habilidadExistente) {
        throw crearError(404, 'La habilidad no existe.');
    }

    // Verificamos que la nueva categoría exista.
    const categoria = await categoriasRepository.findById(datos.idCategoria);

    if (!categoria) {
        throw crearError(404, 'La categoría indicada no existe.');
    }

    try {
        return await habilidadesRepository.update(id, datos);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw crearError(
                409,
                'Ya existe una habilidad con ese nombre en la categoría indicada.'
            );
        }

        throw error;
    }
}

// Elimina una habilidad.
export async function eliminarHabilidad(id) {
    try {
        const eliminada = await habilidadesRepository.remove(id);

        if (!eliminada) {
            throw crearError(404, 'La habilidad no existe.');
        }
    } catch (error) {
        // Una habilidad asociada a usuarios no se puede borrar.
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            throw crearError(
                409,
                'No puedes eliminar esta habilidad porque está asociada a registros de usuarios.'
            );
        }

        throw error;
    }
}