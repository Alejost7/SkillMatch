# SkillMatch

SkillMatch es una plataforma web orientada al intercambio no monetario de conocimientos y habilidades. Permite que las personas publiquen habilidades que pueden enseñar, registren habilidades que desean aprender, busquen coincidencias, envíen solicitudes de conexión, se comuniquen y califiquen las experiencias de intercambio.

Actualmente, el proyecto implementa en el backend los módulos de gestión de categorías, gestión de habilidades, autenticación, usuarios, habilidades del usuario, solicitudes de conexión, conexiones y mensajería. Estos módulos exponen APIs REST conectadas a una base de datos MariaDB y permiten administrar el catálogo de áreas de conocimiento, las habilidades asociadas a cada categoría, el registro de usuarios, el inicio de sesión, la consulta o actualización del perfil del usuario autenticado, las habilidades que cada persona ofrece o desea aprender, la búsqueda de personas, el envío, aceptación, rechazo o cancelación de solicitudes de conexión entre usuarios y la conversación privada entre los participantes de una conexión aceptada.

## Tecnologías utilizadas

- JavaScript
- React
- Vite
- Node.js
- Express
- JSON Web Token (JWT)
- bcrypt
- MariaDB / MySQL
- Tailwind CSS v4
- Inter, como tipografía principal

## Estructura del repositorio

```text
SkillMatch/
├── backend/
│   ├── scripts/
│   │   └── migrar.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── roles.js
│   │   ├── middlewares/
│   │   │   ├── autenticacion.js
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── categorias/
│   │   │   │   ├── categorias.controller.js
│   │   │   │   ├── categorias.repository.js
│   │   │   │   ├── categorias.routes.js
│   │   │   │   ├── categorias.service.js
│   │   │   │   └── categorias.validation.js
│   │   │   ├── habilidades/
│   │   │   │   ├── habilidades.controller.js
│   │   │   │   ├── habilidades.repository.js
│   │   │   │   ├── habilidades.routes.js
│   │   │   │   ├── habilidades.service.js
│   │   │   │   └── habilidades.validation.js
│   │   │   ├── habilidades-usuario/
│   │   │   │   ├── habilidades-usuario.controller.js
│   │   │   │   ├── habilidades-usuario.mapper.js
│   │   │   │   ├── habilidades-usuario.repository.js
│   │   │   │   ├── habilidades-usuario.routes.js
│   │   │   │   ├── habilidades-usuario.service.js
│   │   │   │   └── habilidades-usuario.validation.js
│   │   │   ├── solicitudes/
│   │   │   │   ├── solicitudes.controller.js
│   │   │   │   ├── solicitudes.mapper.js
│   │   │   │   ├── solicitudes.repository.js
│   │   │   │   ├── solicitudes.routes.js
│   │   │   │   ├── solicitudes.service.js
│   │   │   │   └── solicitudes.validation.js
│   │   │   ├── conexiones/
│   │   │   │   ├── conexiones.controller.js
│   │   │   │   ├── conexiones.mapper.js
│   │   │   │   ├── conexiones.repository.js
│   │   │   │   ├── conexiones.routes.js
│   │   │   │   ├── conexiones.service.js
│   │   │   │   └── conexiones.validation.js
│   │   │   └── usuarios/
│   │   │       ├── usuarios.controller.js
│   │   │       ├── usuarios.repository.js
│   │   │       ├── usuarios.routes.js
│   │   │       ├── usuarios.service.js
│   │   │       └── usuarios.validation.js
│   │   ├── utils/
│   │   │   ├── campos.js
│   │   │   └── consulta.js
│   │   └── server.js
│   ├── tests/
│   │   ├── config/
│   │   │   └── env.test.js
│   │   ├── helpers/
│   │   │   └── fakes.js
│   │   ├── middlewares/
│   │   │   ├── autenticacion.test.js
│   │   │   ├── errorHandler.test.js
│   │   │   └── notFound.test.js
│   │   ├── modules/
│   │   │   ├── conexiones.validation.test.js
│   │   │   ├── habilidades-usuario.validation.test.js
│   │   │   ├── solicitudes.validation.test.js
│   │   │   └── validaciones.test.js
│   │   ├── utils/
│   │   │   └── consulta.test.js
│   │   ├── app.test.js
│   │   └── entorno-pruebas.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── migrations/
│   │   └── 001_uq_habilidad_nombre_categoria.sql
│   ├── seed.sql
│   └── shema.sql
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   │   ├── AdminLayout.jsx
    │   │   └── PublicLayout.jsx
    │   ├── modules/
    │   │   └── categorias/
    │   │       ├── components/
    │   │       ├── CategoriasPage.jsx
    │   │       ├── categorias.api.js
    │   │       └── categorias.validation.js
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── RegisterPage.jsx
    │   │   └── public/
    │   │       └── HomePage.jsx
    │   ├── services/
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

### Organización del frontend

El frontend está organizado por responsabilidades:

- `components/`: componentes reutilizables entre diferentes páginas o módulos.
- `layouts/`: estructuras visuales compartidas. `PublicLayout` se utiliza en las
  páginas públicas y `AdminLayout` en las páginas administrativas.
- - `modules/`: funcionalidades agrupadas por dominio. Actualmente contiene el
  módulo de categorías y sus componentes, validaciones y peticiones a la API.
  Los módulos de habilidades, autenticación y usuarios actualmente están
  implementados en el backend.
- `pages/`: páginas asociadas a rutas de la aplicación. Las páginas públicas se
  encuentran en `pages/public/` y las páginas de autenticación en `pages/auth/`.
- `services/`: servicios compartidos, como el cliente para comunicarse con el backend.
- `styles/`: estilos globales de la aplicación.
- `App.jsx`: configuración de las rutas del frontend mediante React Router.
- `main.jsx`: punto de entrada de la aplicación React.

Las rutas principales del frontend son:

| Ruta | Página | Layout |
| ---- | ------ | ------ |
| `/` | Landing o página de inicio | `PublicLayout` |
| `/login` | Inicio de sesión | `PublicLayout` |
| `/registro` | Registro de usuario | `PublicLayout` |
| `/admin/categorias` | Gestión de categorías | `AdminLayout` |

## Módulos implementados

### Gestión de categorías

El módulo permite:

- Listar las categorías registradas.
- Crear una nueva categoría.
- Actualizar una categoría existente.
- Eliminar una categoría.
- Mostrar mensajes de éxito o error según el resultado de cada operación.
- Confirmar la eliminación mediante un diálogo de confirmación.

## Endpoints del módulo de categorías

Las consultas del catálogo son públicas; crear, actualizar o eliminar exige un token de un usuario con rol `administrador`.

| Método   | Ruta                  | Protegido           | Descripción             |
| -------- | --------------------- | ------------------- | ----------------------- |
| `GET`    | `/api/categorias`     | No                  | Lista las categorías    |
| `POST`   | `/api/categorias`     | Sí (administrador)  | Crea una categoría      |
| `PUT`    | `/api/categorias/:id` | Sí (administrador)  | Actualiza una categoría |
| `DELETE` | `/api/categorias/:id` | Sí (administrador)  | Elimina una categoría   |

### Gestión de habilidades

El módulo de habilidades permite administrar el catálogo de habilidades asociadas a las categorías de conocimiento. Cada habilidad pertenece a una categoría y puede ser utilizada posteriormente por los usuarios para registrar las habilidades que ofrecen o desean aprender.

El módulo permite:

- Listar todas las habilidades registradas.
- Filtrar el catálogo por categoría, nombre y estado, con paginación.
- Consultar una habilidad por su identificador.
- Crear una nueva habilidad asociada a una categoría existente.
- Actualizar una habilidad existente.
- Eliminar una habilidad.
- Validar que la categoría indicada exista.
- Evitar que se registre una habilidad duplicada dentro de la misma categoría.
- Mostrar mensajes de éxito o error según el resultado de cada operación.

### Endpoints del módulo de habilidades

Las consultas del catálogo son públicas; crear, actualizar o eliminar exige un token de un usuario con rol `administrador`.

| Método   | Ruta                             | Protegido          | Descripción                                       |
| -------- | -------------------------------- | ------------------ | ------------------------------------------------- |
| `GET`    | `/api/habilidades`               | No                 | Lista habilidades con filtros y paginación        |
| `GET`    | `/api/habilidades/:id`           | No                 | Consulta una habilidad por su identificador       |
| `POST`   | `/api/habilidades`               | Sí (administrador) | Crea una habilidad                                |
| `PUT`    | `/api/habilidades/:id`           | Sí (administrador) | Actualiza una habilidad                           |
| `DELETE` | `/api/habilidades/:id`           | Sí (administrador) | Elimina una habilidad                             |

### Filtros y paginación del catálogo

`GET /api/habilidades` acepta estos parámetros opcionales de consulta:

| Parámetro     | Tipo   | Por defecto | Descripción                                             |
| ------------- | ------ | ----------- | ------------------------------------------------------- |
| `categoriaId` | entero | —           | Solo habilidades de esa categoría                       |
| `nombre`      | texto  | —           | Búsqueda parcial por nombre                             |
| `estado`      | texto  | —           | `activo` o `inactivo`                                   |
| `orden`       | texto  | `nombre`    | `nombre` (A-Z) o `recientes` (últimas creadas primero)  |
| `page`        | entero | `1`         | Página solicitada                                       |
| `limit`       | entero | `10`        | Resultados por página (máximo `50`)                     |

La respuesta incluye el arreglo `data` y el objeto `paginacion`, que el frontend usa para construir el paginador.

**Petición:**

```http
GET /api/habilidades?categoriaId=1&nombre=java&estado=activo&page=1&limit=5
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Habilidades consultadas correctamente.",
  "data": [
    {
      "id_habilidad": 1,
      "id_categoria": 1,
      "categoria": "Programación",
      "nombre": "JavaScript",
      "descripcion": "Fundamentos de programación con JavaScript.",
      "estado": "activo"
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 5,
    "total": 1,
    "totalPaginas": 1,
    "tieneAnterior": false,
    "tieneSiguiente": false
  }
}
```

Si un parámetro no es válido (`page=0`, `limit=51`, `estado=borrado`, `orden=precio`), la API responde `400` con la lista de errores en `errors`.

### Ejemplo de creación de habilidad

**Petición:**

```http
POST /api/habilidades
Authorization: Bearer <token de administrador>
Content-Type: application/json
```

```json
{
  "idCategoria": 1,
  "nombre": "JavaScript",
  "descripcion": "Lenguaje de programación para desarrollo web",
  "estado": "activo"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Habilidad creada correctamente.",
  "data": {
    "id_habilidad": 1,
    "id_categoria": 1,
    "categoria": "Programación",
    "nombre": "JavaScript",
    "descripcion": "Lenguaje de programación para desarrollo web",
    "estado": "activo"
  }
}
```

### Restricción única de habilidades por categoría

Para evitar habilidades duplicadas dentro de una misma categoría, la tabla `habilidad` incluye la restricción:

```sql
CONSTRAINT uq_habilidad_nombre_categoria
UNIQUE (id_categoria, nombre)
```

Esta restricción permite que exista una habilidad con el mismo nombre en categorías diferentes, pero impide duplicarla dentro de una misma categoría.

La restricción ya forma parte de `database/shema.sql`. Si la base de datos se creó antes de esta versión, aplica la migración incluida en el repositorio:

```bash
cd backend
npm run db:migrate             # solo informa qué migraciones existen
npm run db:migrate -- --aplicar  # aplica los cambios pendientes
```

Las migraciones de `database/migrations/` comprueban antes de crear la restricción, por lo que se pueden ejecutar varias veces sin duplicarla ni generar errores.

### Autenticación y usuarios

El módulo de autenticación permite registrar usuarios, iniciar sesión y generar un token JWT. Las contraseñas se almacenan cifradas mediante bcrypt, por lo que nunca se guardan en texto plano.

Un token JWT permite identificar al usuario autenticado en las siguientes peticiones. Para acceder a una ruta protegida, el cliente debe enviar el token en el encabezado `Authorization` utilizando el esquema `Bearer`.

```text
Authorization: Bearer <token>
```

El módulo de usuarios permite consultar el perfil del usuario autenticado, actualizar sus datos básicos y consultar la información pública de otros usuarios.

### Endpoints de autenticación

| Método | Ruta                 | Protegido | Descripción                           |
| ------ | -------------------- | --------- | ------------------------------------- |
| `POST` | `/api/auth/registro` | No        | Registra un nuevo usuario             |
| `POST` | `/api/auth/login`    | No        | Inicia sesión y devuelve un token JWT |

### Endpoints de usuarios

| Método | Ruta                   | Protegido | Descripción                                        |
| ------ | ---------------------- | --------- | -------------------------------------------------- |
| `GET`  | `/api/usuarios/perfil` | Sí        | Consulta el perfil del usuario autenticado         |
| `PUT`  | `/api/usuarios/perfil` | Sí        | Actualiza el perfil del usuario autenticado        |
| `GET`  | `/api/usuarios`        | No        | Busca usuarios por nombre, ubicación o habilidades |
| `GET`  | `/api/usuarios/:id`    | No        | Consulta la información pública de un usuario      |

### Búsqueda de usuarios

`GET /api/usuarios` permite encontrar personas con quienes intercambiar habilidades. Solo devuelve cuentas con `estado_cuenta = activo` y nunca incluye el correo electrónico ni la fecha del último acceso.

| Parámetro            | Tipo   | Descripción                                                |
| -------------------- | ------ | ---------------------------------------------------------- |
| `nombre`             | texto  | Busca en nombres, apellidos y alias                        |
| `ciudad`             | texto  | Ciudad del perfil                                          |
| `pais`               | texto  | País del perfil                                            |
| `habilidadOfrecida`  | texto  | Usuarios que ofrecen una habilidad con ese nombre          |
| `habilidadRequerida` | texto  | Usuarios que desean aprender una habilidad con ese nombre  |
| `page`               | entero | Página solicitada (por defecto `1`)                        |
| `limit`              | entero | Resultados por página (por defecto `10`, máximo `50`)      |

Todos los textos usan coincidencia parcial y las habilidades del usuario se devuelven agrupadas:

**Petición:**

```http
GET /api/usuarios?habilidadOfrecida=java&ciudad=tunja&page=1&limit=10
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Usuarios consultados correctamente.",
  "data": [
    {
      "idUsuario": 3,
      "idRol": 1,
      "rol": "usuario",
      "nombres": "Ana",
      "apellidos": "Gómez",
      "alias": "anagomez",
      "fechaRegistro": "2026-11-12T17:05:39.000Z",
      "perfil": {
        "biografia": "Estudiante de ingeniería de sistemas.",
        "fotoPerfilUrl": null,
        "disponibilidad": "Tardes",
        "ciudad": "Tunja",
        "pais": "Colombia"
      },
      "habilidades": {
        "ofrecidas": [
          {
            "idHabilidadOfrecida": 3,
            "idHabilidad": 1,
            "habilidad": "JavaScript",
            "idCategoria": 1,
            "categoria": "Programación",
            "nivel": "avanzado",
            "descripcionApoyo": null,
            "estado": "activo",
            "fechaRegistro": "2026-11-12T17:05:39.000Z"
          }
        ],
        "requeridas": []
      }
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 1,
    "totalPaginas": 1,
    "tieneAnterior": false,
    "tieneSiguiente": false
  }
}
```

`GET /api/usuarios/:id` devuelve la misma estructura de un usuario, también con el bloque `habilidades`.

### Ejemplo de registro

**Petición:**

```http
POST /api/auth/registro
Content-Type: application/json
```

```json
{
  "nombres": "Diego",
  "apellidos": "Santander",
  "correoElectronico": "diego@example.com",
  "contrasena": "12345678",
  "alias": "diegosantander"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Usuario registrado correctamente.",
  "data": {
    "idUsuario": 1,
    "nombres": "Diego",
    "apellidos": "Santander",
    "correoElectronico": "diego@example.com",
    "alias": "diegosantander",
    "idRol": 2
  }
}
```

### Ejemplo de inicio de sesión

**Petición:**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "correoElectronico": "diego@example.com",
  "contrasena": "12345678"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Autenticación satisfactoria.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "idUsuario": 1,
      "nombres": "Diego",
      "apellidos": "Santander",
      "correoElectronico": "diego@example.com",
      "alias": "diegosantander",
      "idRol": 2
    }
  }
}
```

### Ejemplo de consulta del perfil protegido

**Petición:**

```http
GET /api/usuarios/perfil
Authorization: Bearer <token>
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Perfil consultado correctamente.",
  "data": {
    "idUsuario": 1,
    "idRol": 1,
    "rol": "usuario",
    "nombres": "Diego",
    "apellidos": "Santander",
    "alias": "diegosantander",
    "correoElectronico": "diego@example.com",
    "estadoCuenta": "activo",
    "fechaRegistro": "2026-11-05T20:00:00.000Z",
    "ultimoAcceso": "2026-11-05T20:15:00.000Z",
    "perfil": {
      "biografia": null,
      "fotoPerfilUrl": null,
      "disponibilidad": null,
      "ciudad": null,
      "pais": null
    }
  }
}
```

Todas las respuestas del módulo usan `camelCase`. Los datos de la tabla `perfil` se agrupan en el objeto `perfil`; el correo, el estado de la cuenta y el último acceso solo se devuelven en el perfil propio, nunca en la consulta pública `GET /api/usuarios/:id`.

### Ejemplo de actualización del perfil

**Petición:**

```http
PUT /api/usuarios/perfil
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "nombres": "Diego Alejandro",
  "apellidos": "Santander Toro",
  "alias": "diegosantander",
  "biografia": "Estudiante de ingeniería de sistemas",
  "fotoPerfilUrl": "https://ejemplo.com/foto.png",
  "disponibilidad": "Tardes y fines de semana",
  "ciudad": "Bogotá",
  "pais": "Colombia"
}
```

`nombres` y `apellidos` son obligatorios. Los cinco campos finales son opcionales y se guardan en la tabla `perfil`; si no se envían, se conserva el valor anterior, y enviar `null` o una cadena vacía limpia el campo.

### Habilidades ofrecidas y requeridas

El módulo de habilidades del usuario permite registrar qué habilidades ofrece cada persona y cuáles desea aprender. Cada registro asocia al usuario autenticado con una habilidad del catálogo.

- Un usuario **ofrece** una habilidad indicando su nivel (`basico`, `intermedio` o `avanzado`) y una descripción de apoyo opcional.
- Un usuario **requiere** (quiere aprender) una habilidad, con un nivel deseado y un objetivo de aprendizaje opcionales.
- La habilidad debe existir en el catálogo y estar activa; si no existe la API responde `404` y si está inactiva `409`.
- No se puede repetir la misma habilidad dos veces en la misma lista (restricciones `uq_ofrecida_usuario_habilidad` y `uq_requerida_usuario_habilidad`); la API responde `409`.
- Todas las rutas son privadas y trabajan únicamente con los registros del usuario autenticado: usar el identificador de otra persona responde `404`.
- Las actualizaciones son parciales: solo se modifican los campos enviados y los textos opcionales aceptan `null` para limpiarse.

### Endpoints de habilidades del usuario

| Método   | Ruta                                            | Protegido | Descripción                                       |
| -------- | ----------------------------------------------- | --------- | ------------------------------------------------- |
| `GET`    | `/api/habilidades-usuario/ofrecidas`            | Sí        | Lista las habilidades que ofrece el usuario       |
| `POST`   | `/api/habilidades-usuario/ofrecidas`            | Sí        | Registra una habilidad ofrecida                   |
| `PUT`    | `/api/habilidades-usuario/ofrecidas/:id`        | Sí        | Actualiza una habilidad ofrecida                  |
| `DELETE` | `/api/habilidades-usuario/ofrecidas/:id`        | Sí        | Elimina una habilidad ofrecida                    |
| `GET`    | `/api/habilidades-usuario/requeridas`           | Sí        | Lista las habilidades que el usuario desea aprender |
| `POST`   | `/api/habilidades-usuario/requeridas`           | Sí        | Registra una habilidad requerida                  |
| `PUT`    | `/api/habilidades-usuario/requeridas/:id`       | Sí        | Actualiza una habilidad requerida                 |
| `DELETE` | `/api/habilidades-usuario/requeridas/:id`       | Sí        | Elimina una habilidad requerida                   |

### Ejemplo de registro de habilidad ofrecida

**Petición:**

```http
POST /api/habilidades-usuario/ofrecidas
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "idHabilidad": 1,
  "nivel": "avanzado",
  "descripcionApoyo": "Clases los sábados por la mañana",
  "estado": "activo"
}
```

**Respuesta `201 Created`:**

```json
{
  "success": true,
  "message": "Habilidad ofrecida registrada correctamente.",
  "data": {
    "idHabilidadOfrecida": 12,
    "idHabilidad": 1,
    "habilidad": "JavaScript",
    "idCategoria": 1,
    "categoria": "Programación",
    "nivel": "avanzado",
    "descripcionApoyo": "Clases los sábados por la mañana",
    "estado": "activo",
    "fechaRegistro": "2026-11-12T14:30:00.000Z"
  }
}
```

### Ejemplo de actualización parcial

**Petición:**

```http
PUT /api/habilidades-usuario/requeridas/5
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "nivelDeseado": "intermedio",
  "objetivoAprendizaje": "Consultar bases de datos con SQL"
}
```

En la actualización todos los campos son opcionales, pero se debe enviar al menos uno. Los textos opcionales (`descripcionApoyo`, `objetivoAprendizaje`) y el `nivelDeseado` aceptan `null` o una cadena vacía para limpiarse; el `nivel` de una habilidad ofrecida solo admite los tres valores permitidos.

### Solicitudes de conexión y conexiones

Cuando una persona encuentra a otra con habilidades complementarias puede enviarle una solicitud de conexión. El flujo de estados es:

- **Pendiente**: el emisor envía la solicitud con un mensaje inicial opcional (máximo 500 caracteres).
- **Aceptada**: solo el receptor puede aceptarla. Al aceptarla se crea automáticamente la conexión entre ambos usuarios, dentro de una transacción.
- **Rechazada**: solo el receptor puede rechazarla.
- **Cancelada**: solo el emisor puede cancelar una solicitud pendiente.

Reglas de negocio:

- No se puede enviar una solicitud a uno mismo (`400`).
- El receptor debe existir (`404`) y estar activo (`409`).
- No puede haber dos solicitudes pendientes entre las mismas dos personas, sin importar quién las envió (`409`).
- Tampoco se puede enviar una solicitud cuando ya existe una conexión activa entre ambos (`409`).
- Una solicitud solo se responde una vez: si ya fue aceptada, rechazada o cancelada, una nueva respuesta devuelve `409`.
- Responder una solicitud ajena devuelve `403`; consultar una solicitud o una conexión en la que no se participa devuelve `404`.
- Cualquiera de los dos participantes puede finalizar una conexión activa (`409` si ya no está activa).

### Endpoints de solicitudes de conexión y conexiones

| Método  | Ruta                                   | Protegido | Descripción                                              |
| ------- | -------------------------------------- | --------- | -------------------------------------------------------- |
| `POST`  | `/api/solicitudes`                     | Sí        | Envía una solicitud de conexión                          |
| `GET`   | `/api/solicitudes/recibidas`           | Sí        | Lista las solicitudes recibidas con filtros y paginación |
| `GET`   | `/api/solicitudes/enviadas`            | Sí        | Lista las solicitudes enviadas con filtros y paginación  |
| `GET`   | `/api/solicitudes/:id`                 | Sí        | Consulta una solicitud del usuario                       |
| `PATCH` | `/api/solicitudes/:id/aceptar`         | Sí        | Acepta la solicitud y crea la conexión                   |
| `PATCH` | `/api/solicitudes/:id/rechazar`        | Sí        | Rechaza la solicitud                                     |
| `PATCH` | `/api/solicitudes/:id/cancelar`        | Sí        | Cancela una solicitud pendiente enviada por el usuario   |
| `GET`   | `/api/conexiones`                      | Sí        | Lista las conexiones del usuario con paginación          |
| `GET`   | `/api/conexiones/:id`                  | Sí        | Consulta una conexión del usuario                        |
| `PATCH` | `/api/conexiones/:id/finalizar`        | Sí        | Finaliza una conexión activa                             |

Los listados aceptan `estado` (para solicitudes: `pendiente`, `aceptada`, `rechazada` o `cancelada`; para conexiones: `activa`, `finalizada` o `bloqueada`), además de `page` y `limit`, y responden con el mismo objeto `paginacion` de los demás listados. Las respuestas incluyen los datos públicos de los dos participantes; en las conexiones se agrega `interlocutor` con la otra persona vista desde el usuario autenticado.

### Ejemplo de envío y aceptación de una solicitud

**Petición:**

```http
POST /api/solicitudes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "idUsuarioReceptor": 8,
  "mensajeInicial": "Hola, vi que ofreces JavaScript y yo puedo ayudarte con diseño."
}
```

**Respuesta `201 Created`:**

```json
{
  "success": true,
  "message": "Solicitud enviada correctamente.",
  "data": {
    "idSolicitud": 15,
    "emisor": {
      "idUsuario": 4,
      "nombres": "Ana",
      "apellidos": "Gómez",
      "alias": "anag"
    },
    "receptor": {
      "idUsuario": 8,
      "nombres": "Luis",
      "apellidos": "Pérez",
      "alias": "luisp"
    },
    "mensajeInicial": "Hola, vi que ofreces JavaScript y yo puedo ayudarte con diseño.",
    "estado": "pendiente",
    "fechaEnvio": "2026-11-12T15:00:00.000Z",
    "fechaRespuesta": null
  }
}
```

Cuando el receptor acepta con `PATCH /api/solicitudes/15/aceptar`, la respuesta incluye la solicitud actualizada y la conexión creada en `data.conexion` con el estado `activa`.

### Mensajería de las conexiones

Cada conexión aceptada funciona como una conversación privada entre los dos participantes. El módulo permite enviar mensajes, consultar el historial, marcar como leídos los mensajes recibidos y saber cuántos mensajes esperan respuesta.

Reglas de negocio:

- Solo los dos participantes de la conexión pueden leer y escribir en ella; cualquier otro usuario recibe `404` para no revelar que la conversación existe.
- Solo se pueden enviar mensajes mientras la conexión esté `activa`; si está `finalizada` o `bloqueada` la respuesta es `409`. El historial se puede seguir consultando.
- El contenido es obligatorio, se guarda recortado y admite hasta 1000 caracteres (`400` si está vacío o excede el límite).
- La marca de leído solo afecta a los mensajes recibidos: los propios nunca se marcan.
- Cada mensaje incluye `esPropio` para que el cliente alinee la burbuja sin comparar identificadores.

### Endpoints de mensajería

| Método  | Ruta                      | Protegido | Descripción                                              |
| ------- | ------------------------- | --------- | -------------------------------------------------------- |
| `POST`  | `/api/mensajes`           | Sí        | Envía un mensaje a una conexión activa                   |
| `GET`   | `/api/mensajes`           | Sí        | Lista los mensajes del usuario con filtros y paginación  |
| `PATCH` | `/api/mensajes/leidos`    | Sí        | Marca como leídos los mensajes recibidos en una conexión |
| `GET`   | `/api/mensajes/no-leidos` | Sí        | Resume los mensajes sin leer por conexión                |

El listado acepta `conexionId`, `page` y `limit`, y devuelve los mensajes en orden cronológico ascendente junto con su `paginacion`. Sin `conexionId` se listan los mensajes de todas las conexiones del usuario. Las respuestas de `/api/conexiones` incluyen el campo `noLeidos` con los mensajes recibidos que todavía no se leyeron.

**Petición:**

```http
POST /api/mensajes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "idConexion": 7,
  "contenido": "Hola, ¿nos vemos el sábado para practicar?"
}
```

**Respuesta `201 Created`:**

```json
{
  "success": true,
  "message": "Mensaje enviado correctamente.",
  "data": {
    "idMensaje": 31,
    "idConexion": 7,
    "remitente": {
      "idUsuario": 4,
      "nombres": "Ana",
      "apellidos": "Gómez",
      "alias": "anag"
    },
    "contenido": "Hola, ¿nos vemos el sábado para practicar?",
    "leido": false,
    "fechaEnvio": "2026-11-12T15:30:00.000Z",
    "esPropio": true
  }
}
```


Además de las variables de conexión a la base de datos, el backend utiliza las siguientes variables:

```env
JWT_SECRET=cambia_esta_clave_en_produccion
JWT_EXPIRES_IN=1h
```

- `JWT_SECRET`: clave secreta utilizada para firmar y verificar los tokens. Es **obligatoria** y debe tener al menos 16 caracteres. El backend no arranca si falta o es demasiado corta, y muestra un mensaje indicando exactamente qué variable corregir.
- `JWT_EXPIRES_IN`: tiempo de expiración del token. Acepta el formato de `jsonwebtoken` (`30m`, `1h`, `7d`). Si se omite, se usa `1h`.

Si `JWT_SECRET` conserva el valor de ejemplo de `.env.example`, el arranque muestra una advertencia en la consola.

Estas variables no deben compartirse ni subirse al repositorio. Para generar una clave segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

La validación de toda la configuración vive en `backend/src/config/env.js` y se ejecuta al arrancar el backend.

### Roles del sistema

| Id | Nombre          | Descripción                                        |
| -- | --------------- | -------------------------------------------------- |
| 1  | `usuario`       | Persona registrada que ofrece y solicita habilidades |
| 2  | `administrador` | Persona encargada de gestionar y moderar la plataforma |

El backend identifica el rol por su **nombre** (`backend/src/config/roles.js`) y usa el id solo como respaldo. Los roles se cargan con `database/seed.sql`.

El registro público siempre crea usuarios con el rol `usuario`. Para probar funciones administrativas, promueve manualmente una cuenta ya registrada:

```sql
USE skillmatch;

UPDATE usuario
SET id_rol = 2
WHERE correo_electronico = 'tu_correo@ejemplo.com';

-- Verificación
SELECT u.correo_electronico, r.nombre AS rol
FROM usuario u
INNER JOIN rol r ON r.id_rol = u.id_rol
WHERE u.correo_electronico = 'tu_correo@ejemplo.com';
```

Después de la promoción hay que iniciar sesión de nuevo para que el token incluya el rol actualizado.

## Pruebas automatizadas del backend

El backend incluye una suite de pruebas construida con el runner nativo de Node (`node:test` y `node:assert`), por lo que no requiere dependencias adicionales ni una base de datos en ejecución.

```bash
cd backend
npm test          # ejecuta la suite completa
npm run test:watch  # vuelve a ejecutar al guardar cambios
```

Qué cubre la suite:

- Validación de la configuración del entorno (`tests/config/env.test.js`): variables obligatorias, puertos, `JWT_SECRET` y `JWT_EXPIRES_IN`, mensajes de error agregados y advertencias.
- Autenticación (`tests/middlewares/autenticacion.test.js`): formato del encabezado `Authorization`, tokens válidos, expirados, firmados con otro secreto o sin firma, y autorización de administrador.
- Manejo de errores (`tests/middlewares/errorHandler.test.js`) y rutas inexistentes (`tests/middlewares/notFound.test.js`).
- Validaciones de entrada de los módulos (`tests/modules/validaciones.test.js`), incluidos los campos extendidos del perfil (`biografia`, `fotoPerfilUrl`, `disponibilidad`, `ciudad`, `pais`). Las habilidades del usuario tienen su propio archivo (`tests/modules/habilidades-usuario.validation.test.js`): niveles, estados, textos libres, actualizaciones parciales e identificadores. Las solicitudes de conexión (`tests/modules/solicitudes.validation.test.js`), las conexiones (`tests/modules/conexiones.validation.test.js`) y la mensajería (`tests/modules/mensajes.validation.test.js`) cubren el receptor, el mensaje inicial, el contenido de los mensajes, los filtros de estado y los identificadores.
- Utilidades de listados (`tests/utils/consulta.test.js`): valores por defecto de `page` y `limit`, metadatos de paginación y validación de filtros de texto, identificadores y valores cerrados (`estado`, `orden`).
- Integración HTTP básica (`tests/app.test.js`): se levanta la aplicación en un puerto libre y se comprueban respuestas reales de rutas que no consultan la base de datos, incluido el 401/403 de las escrituras del catálogo, el 400 de las validaciones, el 400 de los filtros de los listados (`page`, `limit`, `estado`, `orden`, `habilidadOfrecida`, `conexionId`), el 401 de las ocho rutas de habilidades del usuario, el 401 de las diez rutas de solicitudes y conexiones y el 401 de las cuatro rutas de mensajería.

La suite completa suma 157 casos y no necesita MySQL en ejecución. Si una prueba falla, `npm test` termina con código de salida distinto de cero.

El archivo `tests/entorno-pruebas.js` define variables de entorno mínimas para que las pruebas puedan cargar la configuración sin depender de un `.env` específico.

## Pruebas del módulo de categorías

Desde el frontend se pueden realizar las siguientes pruebas. Crear, editar o eliminar exige un token de administrador (ver la sección de promoción de administrador):

1. Abrir la sección de categorías.
2. Verificar que la lista cargue correctamente.
3. Crear una categoría nueva.
4. Editar una categoría existente.
5. Eliminar una categoría mediante el diálogo de confirmación.
6. Comprobar que la tabla se actualice después de cada operación.
7. Verificar que la creación, edición y eliminación devuelvan 401 sin token y 403 con un usuario que no sea administrador.

## Pruebas del módulo de habilidades

Desde Postman se pueden realizar las siguientes pruebas. Crear, editar o eliminar exige un token de administrador:

1. Listar todas las habilidades.
2. Paginar el listado con `page` y `limit` y comprobar el objeto `paginacion`.
3. Filtrar por categoría con `categoriaId`.
4. Buscar por `nombre` y comprobar que la coincidencia sea parcial.
5. Filtrar por `estado=activo` y ordenar con `orden=recientes`.
6. Enviar `limit=51` o `page=0` y comprobar que la API responda `400`.
7. Consultar una habilidad por su identificador.
8. Crear una habilidad asociada a una categoría existente.
9. Intentar crear una habilidad sin categoría o con una categoría inexistente.
10. Intentar crear una habilidad duplicada dentro de la misma categoría.
11. Actualizar una habilidad existente.
12. Eliminar una habilidad.
13. Verificar que la lista se actualice correctamente después de cada operación.

## Pruebas del módulo de autenticación y usuarios

Desde Postman se pueden realizar las siguientes pruebas:

1. Registrar un usuario nuevo mediante `POST /api/auth/registro`.
2. Intentar registrar un usuario con un correo electrónico duplicado.
3. Iniciar sesión con credenciales válidas mediante `POST /api/auth/login`.
4. Intentar iniciar sesión con una contraseña incorrecta.
5. Copiar el token JWT recibido en el inicio de sesión.
6. Consultar el perfil del usuario autenticado mediante `GET /api/usuarios/perfil`.
7. Intentar consultar el perfil protegido sin enviar el token.
8. Actualizar el perfil del usuario autenticado mediante `PUT /api/usuarios/perfil`.
9. Consultar la información pública de un usuario mediante `GET /api/usuarios/:id` y comprobar que incluya `habilidades`.
10. Buscar usuarios por habilidad ofrecida mediante `GET /api/usuarios?habilidadOfrecida=javascript`.
11. Repetir la búsqueda con `habilidadRequerida`, `nombre`, `ciudad` y `pais`.
12. Comprobar que el listado devuelva `paginacion` y que no exponga `correoElectronico`.
13. Enviar `page=0` o un `nombre` de más de 100 caracteres y comprobar que la API responda `400`.
14. Verificar que las rutas protegidas rechacen peticiones con un token inválido o expirado.

## Pruebas del módulo de habilidades del usuario

Desde Postman se pueden realizar las siguientes pruebas. Todas las rutas exigen un token de cualquier usuario autenticado y operan sobre sus propios registros:

1. Listar las habilidades ofrecidas mediante `GET /api/habilidades-usuario/ofrecidas`.
2. Registrar una habilidad ofrecida con `nivel` válido.
3. Intentar registrar la misma habilidad ofrecida dos veces (debe responder `409`).
4. Intentar registrar una habilidad inexistente (`404`) o inactiva (`409`).
5. Actualizar solo el nivel de una habilidad ofrecida y comprobar que la descripción se conserve.
6. Enviar `descripcionApoyo: null` y comprobar que el campo se limpie.
7. Registrar una habilidad requerida con `nivelDeseado` y `objetivoAprendizaje`.
8. Actualizar una habilidad requerida sin enviar campos (debe responder `400`).
9. Eliminar un registro y volver a intentarlo (debe responder `404`).
10. Usar el identificador de un registro de otro usuario y comprobar que responda `404`.
11. Verificar que las ocho rutas respondan `401` cuando no se envía el token.

## Pruebas del módulo de solicitudes y conexiones

Desde Postman se pueden realizar las siguientes pruebas con dos usuarios registrados (cada uno con su token):

1. Enviar una solicitud con `POST /api/solicitudes` indicando `idUsuarioReceptor` y un `mensajeInicial`.
2. Intentar enviarse una solicitud a uno mismo y comprobar que responda `400`.
3. Repetir el envío al mismo usuario (debe responder `409`).
4. Consultar las solicitudes pendientes con `GET /api/solicitudes/recibidas?estado=pendiente`.
5. Filtrar las enviadas con `GET /api/solicitudes/enviadas` y comprobar el objeto `paginacion`.
6. Aceptar la solicitud con el token del receptor y comprobar que devuelva la solicitud `aceptada` y la conexión `activa`.
7. Intentar aceptarla de nuevo (debe responder `409`).
8. Intentar rechazar una solicitud con el token del emisor (debe responder `403`).
9. Crear otra solicitud y rechazarla con el token del receptor.
10. Crear una tercera solicitud y cancelarla con el token del emisor.
11. Consultar `GET /api/conexiones?estado=activa`, comprobar `interlocutor` y finalizarla con `PATCH /api/conexiones/:id/finalizar`.
12. Volver a finalizar la misma conexión (debe responder `409`).
13. Consultar una solicitud o conexión de otras personas y comprobar que responda `404`.
14. Enviar `page=0`, `limit=100`, `estado=otro` o un `id` no numérico y comprobar que la API responda `400`.
15. Verificar que las diez rutas respondan `401` cuando no se envía el token.

## Requisitos previos

Antes de ejecutar el proyecto, instala:

- Node.js 20 o superior.
- MariaDB o MySQL.
- Visual Studio Code u otro editor de código.
- Git.

Verifica las instalaciones con:

```bash
node -v
npm -v
```

## Configuración de la base de datos

1. Crea la base de datos en MariaDB o MySQL.
2. Ejecuta `database/shema.sql` para crear las tablas (incluye la restricción única de habilidades por categoría).
3. Ejecuta `database/seed.sql` para cargar los roles (1 = usuario, 2 = administrador) y los datos iniciales. Ambos scripts se pueden volver a ejecutar sin duplicar datos.
4. Si la base de datos ya existía antes de esta versión, aplica las migraciones pendientes:

   ```bash
   cd backend
   npm run db:migrate -- --aplicar
   ```

5. Copia el archivo `.env.example` como `.env` dentro de `backend/`.
6. Configura las credenciales de tu base de datos y un `JWT_SECRET` propio de al menos 16 caracteres.

Ejemplo de variables de entorno:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=skillmatch
JWT_SECRET=una_clave_larga_y_dificil_de_adivinar
JWT_EXPIRES_IN=1h
```

El backend valida estas variables al arrancar: si falta alguna o tiene un formato inválido, no inicia y muestra el listado de errores encontrados.

## Instalación y ejecución

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend quedará disponible en:

```text
http://localhost:3000
```

Para ejecutar las pruebas automatizadas del backend:

```bash
cd backend
npm test
```

### Frontend

Abre otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend quedará disponible en:

```text
http://localhost:5173
```

---

# Identidad visual y sistema de diseño

SkillMatch utiliza una interfaz **dark mode**, moderna y de alto contraste, pensada principalmente para su uso desde dispositivos móviles. La identidad visual está basada en la documentación técnica del proyecto y debe mantenerse de forma consistente en todos los componentes de React.

## Paleta de colores

| Token          | Valor     | Uso principal                                                              |
| -------------- | --------- | -------------------------------------------------------------------------- |
| `primary`      | `#60A5FA` | Acciones principales, enlaces, botones destacados y elementos interactivos |
| `primary-dark` | `#3B82F6` | Estado hover o variantes más intensas del color primario                   |
| `success`      | `#34D399` | Estados de éxito, confirmaciones y etiquetas de habilidades                |
| `accent`       | `#FBBF24` | Alertas, avisos, insignias y notificaciones                                |
| `background`   | `#020617` | Fondo general de la aplicación                                             |
| `surface`      | `#0F172A` | Tarjetas, barra de navegación, sidebar y paneles                           |
| `text-main`    | `#F1F5F9` | Texto principal sobre fondo oscuro                                         |
| `text-muted`   | `#94A3B8` | Texto secundario, descripciones y metadatos                                |
| `danger`       | `#EF4444` | Errores, validaciones y acciones destructivas                              |
| `warning`      | `#FACC15` | Advertencias y estados pendientes                                          |

## Tipografía

La tipografía principal es **Inter**, cargada desde Google Fonts.

| Uso                 | Peso      | Tamaño recomendado |
| ------------------- | --------- | ------------------ |
| Texto normal        | 400       | 14–16 px           |
| Énfasis y etiquetas | 500       | 14 px              |
| Botones             | 500 o 600 | 14 px              |
| Subtítulos          | 600       | 18–20 px           |
| Títulos principales | 700       | 24–32 px           |

El interlineado recomendado es entre `1.4` y `1.6` para facilitar la lectura en pantallas móviles.

## Configuración de Tailwind CSS v4

El proyecto utiliza Tailwind CSS v4 mediante el plugin oficial de Vite:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  }
})
```

En Tailwind v4 no se utiliza `tailwind.config.js`. La configuración del tema se realiza directamente en el archivo `global.css` mediante la directiva `@theme`.

### Archivo `global.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;

  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
  --color-primary-light: #dbeafe;

  --color-success: #34d399;
  --color-success-light: #d1fae5;

  --color-accent: #fbbf24;
  --color-accent-light: #fef3c7;

  --color-background: #020617;
  --color-surface: #0f172a;
  --color-surface-alt: #020617;

  --color-text-main: #f1f5f9;
  --color-text-muted: #94a3b8;

  --color-danger: #ef4444;
  --color-warning: #facc15;
}

body {
  margin: 0;
  min-width: 320px;
  background-color: var(--color-background);
  color: var(--color-text-main);
  font-family: var(--font-sans);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

input,
textarea,
select,
button {
  font-family: inherit;
}
```

Las variables definidas con el prefijo `--color-*` generan automáticamente utilidades de Tailwind, como `bg-primary`, `text-primary`, `border-primary`, `bg-surface`, entre otras.

## Carga de la tipografía Inter

En el archivo `index.html` del frontend, dentro de `<head>`, se debe incluir:

```html
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin />
<link
  href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)"
  rel="stylesheet"
/>
```

## Clases principales del sistema

| Clase              | Uso                                          |
| ------------------ | -------------------------------------------- |
| `bg-background`    | Fondo general azul noche                     |
| `bg-surface`       | Fondo de tarjetas, navbar, sidebar y paneles |
| `text-text-main`   | Texto principal claro                        |
| `text-text-muted`  | Texto secundario o descriptivo               |
| `bg-primary`       | Botones y acciones principales               |
| `text-primary`     | Enlaces, íconos o textos destacados          |
| `border-primary`   | Bordes con el color principal                |
| `bg-success`       | Estados de éxito o confirmación              |
| `text-success`     | Etiquetas o mensajes positivos               |
| `bg-accent`        | Alertas, insignias y elementos destacados    |
| `text-accent`      | Texto de advertencia o habilidad destacada   |
| `bg-danger`        | Errores o acciones destructivas              |
| `border-slate-800` | Bordes sutiles sobre fondo oscuro            |
| `rounded-lg`       | Bordes redondeados en botones y campos       |
| `rounded-xl`       | Bordes redondeados en tarjetas y modales     |
| `shadow-lg`        | Sombra para destacar tarjetas y paneles      |

## Estilo de componentes

### Botones

Los botones principales usan el color primario y texto oscuro para garantizar contraste:

```jsx
<button className="bg-primary text-slate-950 font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition">
  Guardar categoría
</button>
```

Botón secundario:

```jsx
<button className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition">
  Cancelar
</button>
```

Botón de eliminación:

```jsx
<button className="bg-danger text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition">
  Eliminar
</button>
```

### Tarjetas

Las tarjetas usan fondo oscuro, borde sutil y esquinas redondeadas:

```jsx
<div className="bg-surface border border-slate-800 rounded-xl p-4 shadow-lg">
  <h3 className="text-lg font-semibold text-text-main">Título</h3>
  <p className="text-sm text-text-muted">Descripción del contenido.</p>
</div>
```

### Formularios

Los campos deben tener fondo oscuro, borde visible y foco con el color primario:

```jsx
<input
  type="text"
  placeholder="Nombre de la categoría"
  className="w-full bg-surface-alt border border-slate-700 text-text-main rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
/>
```

Mensaje de error:

```jsx
<p className="text-sm text-danger mt-1">
  El nombre de la categoría es obligatorio.
</p>
```

### Etiquetas de habilidad

Las etiquetas o *chips* se utilizan para mostrar habilidades, niveles o estados:

```jsx
<span className="bg-success/15 text-success text-xs px-2 py-1 rounded-full">
  JavaScript · Intermedio
</span>

<span className="bg-accent/15 text-accent text-xs px-2 py-1 rounded-full">
  Quiere aprender React
</span>
```

### Alertas

```jsx
<div className="bg-success/15 border border-success text-success px-4 py-3 rounded-lg">
  Categoría creada correctamente.
</div>

<div className="bg-danger/15 border border-danger text-danger px-4 py-3 rounded-lg">
  No fue posible eliminar la categoría.
</div>
```

## Diseño responsivo

El proyecto sigue un enfoque **mobile first**: los estilos base están pensados para pantallas pequeñas y se amplían progresivamente a tableta y escritorio.

```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
  {/* Tarjetas o listados */}
</div>
```

Puntos de quiebre utilizados:

| Breakpoint | Tamaño mínimo |
| ---------- | ------------- |
| `sm`       | 640 px        |
| `md`       | 768 px        |
| `lg`       | 1024 px       |
| `xl`       | 1280 px       |

## Accesibilidad

La interfaz debe cumplir las siguientes reglas:

- Contraste mínimo de 4.5:1 para texto normal.
- Áreas táctiles de al menos 44 x 44 px.
- Etiquetas asociadas a cada campo de formulario.
- Texto alternativo en imágenes mediante el atributo `alt`.
- Navegación por teclado en formularios, botones y modales.
- Indicadores de carga durante operaciones con espera.
- Validación en el cliente para mejorar la experiencia y validación en el servidor como fuente de verdad.

## Autor

Diego Alejandro Santander Toro  
Programa: Análisis y Desarrollo de Software  
Proyecto formativo: SkillMatch