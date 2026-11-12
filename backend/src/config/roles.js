// Roles del sistema.
//
// Los identificadores 1 y 2 corresponden a los datos iniciales del proyecto
// (database/seed.sql), pero la fuente de verdad es el nombre del rol: la base
// de datos podría tener otro identificador si fue creada antes de esta versión.
// Por eso las autorizaciones aceptan el nombre del rol y, como respaldo, el id.

export const ROLES = Object.freeze({
    USUARIO: 1,
    ADMINISTRADOR: 2
});

export const NOMBRES_ROL = Object.freeze({
    [ROLES.USUARIO]: 'usuario',
    [ROLES.ADMINISTRADOR]: 'administrador'
});

export const NOMBRE_ROL_USUARIO = NOMBRES_ROL[ROLES.USUARIO];
export const NOMBRE_ROL_ADMINISTRADOR = NOMBRES_ROL[ROLES.ADMINISTRADOR];

/**
 * Indica si el usuario autenticado tiene el rol de administrador.
 * Acepta el nombre del rol (preferido) o el identificador documentado.
 */
export function esAdministrador(usuario = {}) {
    return (
        usuario.rol === NOMBRE_ROL_ADMINISTRADOR ||
        usuario.idRol === ROLES.ADMINISTRADOR
    );
}
