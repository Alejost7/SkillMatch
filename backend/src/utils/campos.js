// Utilidades para combinar los datos enviados por el cliente con los que ya
// están guardados en la base de datos.

// Devuelve el valor recibido si la clave existe en los datos enviados y, si
// no, conserva el valor actual. Así una actualización parcial no borra la
// información que la petición no mencionó.
export function elegirCampo(datos, clave, valorActual) {
    return Object.hasOwn(datos, clave) ? datos[clave] : valorActual;
}
