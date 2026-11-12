// Utilidad compartida por las capas *.api.js para construir query strings.
// Omite los valores vacíos para que el backend use sus valores por defecto y
// nunca reciba parámetros como "nombre=" que rompen la validación.

export function crearConsulta(parametros = {}) {
    const busqueda = new URLSearchParams();

    for (const [clave, valor] of Object.entries(parametros)) {
        if (valor === undefined || valor === null || valor === '') {
            continue;
        }

        busqueda.set(clave, String(valor));
    }

    const cadena = busqueda.toString();

    return cadena ? `?${cadena}` : '';
}
