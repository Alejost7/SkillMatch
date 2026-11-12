import { apiClient } from '../../services/apiClient.js';
import { crearConsulta } from '../../services/consulta.js';

/**
 * Envía una solicitud de conexión a otra persona.
 */
export async function crearSolicitud(datos) {
    const resultado = await apiClient('/solicitudes', {
        method: 'POST',
        body: JSON.stringify(datos)
    });

    return resultado.data;
}

async function listarSolicitudes(ruta, filtros, { signal } = {}) {
    const resultado = await apiClient(
        `${ruta}${crearConsulta(filtros)}`,
        { signal }
    );

    return {
        solicitudes: resultado.data,
        paginacion: resultado.paginacion
    };
}

export function listarRecibidas(filtros = {}, { signal } = {}) {
    return listarSolicitudes('/solicitudes/recibidas', filtros, { signal });
}

export function listarEnviadas(filtros = {}, { signal } = {}) {
    return listarSolicitudes('/solicitudes/enviadas', filtros, { signal });
}

export async function obtenerSolicitud(idSolicitud, { signal } = {}) {
    const resultado = await apiClient(`/solicitudes/${idSolicitud}`, { signal });

    return resultado.data;
}

/**
 * Acepta una solicitud. El backend responde con la solicitud actualizada y la
 * conexión creada: { solicitud, conexion }.
 */
export async function aceptarSolicitud(idSolicitud) {
    const resultado = await apiClient(
        `/solicitudes/${idSolicitud}/aceptar`,
        { method: 'PATCH' }
    );

    return resultado.data;
}

export async function rechazarSolicitud(idSolicitud) {
    const resultado = await apiClient(
        `/solicitudes/${idSolicitud}/rechazar`,
        { method: 'PATCH' }
    );

    return resultado.data;
}

export async function cancelarSolicitud(idSolicitud) {
    const resultado = await apiClient(
        `/solicitudes/${idSolicitud}/cancelar`,
        { method: 'PATCH' }
    );

    return resultado.data;
}
