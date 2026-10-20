export async function apiClient(path, options = {}) {
    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`/api${path}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        throw new Error(
        'Algo anda mal.... El servidor no devolvió una respuesta JSON. Revisa que el backend esté funcionando.'
        );
    }

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(
        result.message ?? 'No fue posible completar la operación.'
        );

        error.status = response.status;
        error.errors = result.errors ?? [];

        throw error;
    }

    return result;
}

// En este apartado se centralizan todas las peticiones y los errores para no repetir código en cada componente.