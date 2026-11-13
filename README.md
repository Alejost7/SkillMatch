# SkillMatch

SkillMatch es una plataforma web orientada al intercambio no monetario de conocimientos y habilidades. Permite que las personas publiquen habilidades que pueden enseñar, registren habilidades que desean aprender, busquen coincidencias, envíen solicitudes de conexión, se comuniquen y califiquen las experiencias de intercambio.

El proyecto está implementado de extremo a extremo. El backend expone una **API REST** con los módulos de categorías, habilidades, autenticación, usuarios, habilidades del usuario, solicitudes de conexión, conexiones, mensajería, calificaciones y notificaciones en tiempo real (SSE); la base de datos MariaDB/MySQL contiene el esquema, los datos iniciales y las migraciones; y el frontend de React + Vite cubre las pantallas públicas, el panel privado de cada usuario y el panel administrativo, con chat, notificaciones en vivo y la página de política de tratamiento de datos. El backend sirve además el frontend compilado, de modo que **toda la aplicación se despliega como un único servicio** con el `Dockerfile` y el `railway.json` incluidos en el repositorio.

## Estado actual del proyecto

| Área | Estado | Ubicación |
| ---- | ------ | --------- |
| API REST (10 módulos, incluido SSE) | Completo | `backend/src/modules/` |
| Autenticación con JWT y roles | Completo | `backend/src/modules/auth/`, `backend/src/config/roles.js` |
| Esquema, datos iniciales y migraciones | Completo | `database/` |
| Frontend público (inicio, login, registro, política de datos, 404) | Completo | `frontend/src/pages/` |
| Panel privado (perfil, habilidades, búsqueda, solicitudes, conexiones, mensajes, calificaciones) | Completo | `frontend/src/modules/`, `frontend/src/layouts/PrivateLayout.jsx` |
| Panel administrativo (categorías y habilidades) | Completo | `frontend/src/modules/`, `frontend/src/layouts/AdminLayout.jsx` |
| Notificaciones en tiempo real (SSE) | Completo | `backend/src/modules/eventos/`, `frontend/src/features/notificaciones/` |
| Navegación móvil con menú de hamburguesa | Completo | `frontend/src/components/MenuMovil.jsx` |
| Pruebas automatizadas del backend | Completo (213 casos, sin base de datos) | `backend/tests/` |
| Despliegue en un solo servicio | Completo | `Dockerfile`, `railway.json`, `Documentation/DESPLIEGUE_RAILWAY.md` |

Qué incluye cada parte:

- **Backend.** Rutas `/api/...` con validación en el servidor, controladores, servicios y repositorios con consultas preparadas, manejo centralizado de errores y respuestas 404 uniformes en JSON. `backend/src/app.js` sirve el SPA compilado (`frontend/dist`) con *fallback* de React Router, y `backend/src/server.js` escucha en `HOST`/`PORT` y se apaga de forma ordenada con `SIGTERM`/`SIGINT`.
- **Frontend.** Organizado por dominios (`modules/`), con contextos de autenticación y de eventos, un cliente HTTP único (`services/apiClient.js`), validaciones por módulo, estados de carga y vacío, diálogos de confirmación y avisos flotantes.
- **Tiempo real.** `GET /api/eventos` mantiene un flujo SSE por usuario y `GET /api/eventos/feed` resume las notificaciones; el cliente lo consume con `EventSource` y muestra indicador de conexión, panel de notificaciones y *toasts*.

Limitaciones conocidas (asumidas y documentadas):

- El registro de conexiones SSE vive en memoria del proceso: el despliegue usa **una sola réplica**; con varias instancias haría falta un bus compartido (por ejemplo Redis pub/sub).
- El flujo SSE se autentica con `?token=<jwt>` porque `EventSource` no envía encabezados; conviene servir HTTPS y no registrar la *query string* en los logs.
- Las pruebas automatizadas cubren el backend; el frontend se valida con `npm run lint` y `npm run build`, además de las pruebas manuales descritas más abajo.

## Tecnologías utilizadas

- JavaScript
- React
- Vite
- Node.js
- Express
- JSON Web Token (JWT)
- bcryptjs
- MariaDB / MySQL
- React Router
- Tailwind CSS v4
- Inter, como tipografía principal
- Docker y Railway, para el despliegue en un único servicio

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
│   │   │   ├── usuarios/
│   │   │   │   ├── usuarios.controller.js
│   │   │   │   ├── usuarios.repository.js
│   │   │   │   ├── usuarios.routes.js
│   │   │   │   ├── usuarios.service.js
│   │   │   │   └── usuarios.validation.js
│   │   │   ├── calificaciones/
│   │   │   │   ├── calificaciones.controller.js
│   │   │   │   ├── calificaciones.mapper.js
│   │   │   │   ├── calificaciones.repository.js
│   │   │   │   ├── calificaciones.routes.js
│   │   │   │   ├── calificaciones.service.js
│   │   │   │   └── calificaciones.validation.js
│   │   │   ├── eventos/
│   │   │   │   ├── eventos.controller.js
│   │   │   │   ├── eventos.mapper.js
│   │   │   │   ├── eventos.registro.js
│   │   │   │   ├── eventos.repository.js
│   │   │   │   ├── eventos.routes.js
│   │   │   │   └── eventos.service.js
│   │   │   └── mensajes/
│   │   │       ├── mensajes.controller.js
│   │   │       ├── mensajes.mapper.js
│   │   │       ├── mensajes.repository.js
│   │   │       ├── mensajes.routes.js
│   │   │       ├── mensajes.service.js
│   │   │       └── mensajes.validation.js
│   │   ├── utils/
│   │   │   ├── campos.js
│   │   │   └── consulta.js
│   │   ├── apagado.js
│   │   ├── app.js
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
│   │   │   ├── calificaciones.validation.test.js
│   │   │   ├── conexiones.validation.test.js
│   │   │   ├── eventos.registro.test.js
│   │   │   ├── habilidades-usuario.validation.test.js
│   │   │   ├── mensajes.validation.test.js
│   │   │   ├── solicitudes.validation.test.js
│   │   │   └── validaciones.test.js
│   │   ├── utils/
│   │   │   └── consulta.test.js
│   │   ├── apagado.test.js
│   │   ├── app.test.js
│   │   └── entorno-pruebas.js
│   ├── .env.example
│   ├── package-lock.json
│   └── package.json
├── database/
│   ├── migrations/
│   │   ├── 001_uq_habilidad_nombre_categoria.sql
│   │   └── 002_idx_mensaje_conexion_mensaje.sql
│   ├── seed.sql
│   └── shema.sql
├── Documentation/
│   └── DESPLIEGUE_RAILWAY.md
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AlertMessage.jsx
│   │   │   ├── CampoArea.jsx
│   │   │   ├── CampoSelect.jsx
│   │   │   ├── CampoTexto.jsx
│   │   │   ├── Cargando.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EstadoVacio.jsx
│   │   │   ├── MenuMovil.jsx
│   │   │   └── Paginacion.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── notificaciones/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── PrivateLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── modules/
│   │   │   ├── calificaciones/
│   │   │   ├── categorias/
│   │   │   ├── conexiones/
│   │   │   ├── habilidades/
│   │   │   ├── habilidadesUsuario/
│   │   │   ├── mensajes/
│   │   │   ├── solicitudes/
│   │   │   └── usuarios/
│   │   ├── pages/
│   │   │   ├── auth/       (LoginPage.jsx, RegisterPage.jsx)
│   │   │   ├── privado/    (InicioPage.jsx)
│   │   │   └── public/     (HomePage.jsx, PoliticaDatosPage.jsx, NoEncontradaPage.jsx)
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── consulta.js
│   │   │   ├── eventosCliente.js
│   │   │   └── sesion.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── utils/
│   │   │   ├── errores.js
│   │   │   └── formato.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package-lock.json
│   └── package.json
├── .dockerignore
├── Dockerfile
├── railway.json
└── README.md
```

Cada carpeta de `frontend/src/modules/` agrupa un dominio completo: la página (`*Page.jsx`), su cliente de API (`*.api.js`), sus validaciones (`*.validation.js`) y una subcarpeta `components/` con los formularios, listados y tarjetas que solo usa ese dominio.

### Organización del frontend

El frontend está organizado por responsabilidades:

- `components/`: componentes reutilizables entre páginas y módulos (campos de
  formulario, alertas, diálogo de confirmación, paginación, estado vacío,
  indicador de carga y el menú móvil `MenuMovil`).
- `features/`: funcionalidades transversales con su contexto y sus componentes.
  `auth/` reúne `AuthContext`, `ProtectedRoute`, los formularios de acceso y sus
  hooks; `notificaciones/` reúne el contexto de eventos SSE, el panel, los
  *toasts* y el indicador de conexión.
- `layouts/`: estructuras visuales compartidas. `PublicLayout` se usa en las
  páginas públicas, `PrivateLayout` en el panel del usuario autenticado y
  `AdminLayout` en el panel administrativo. Los dos paneles muestran la barra
  horizontal en escritorio y el menú de hamburguesa en móvil.
- `modules/`: funcionalidades agrupadas por dominio. Cada módulo contiene su
  página, su cliente de API, sus validaciones y sus componentes: `categorias`,
  `habilidades`, `habilidadesUsuario`, `usuarios`, `solicitudes`, `conexiones`,
  `mensajes` y `calificaciones`.
- `pages/`: páginas asociadas a rutas. Las públicas están en `pages/public/`, las
  de autenticación en `pages/auth/` y la de inicio del panel privado en
  `pages/privado/`.
- `services/`: servicios compartidos: `apiClient.js` (cliente HTTP con el token),
  `sesion.js` (almacenamiento de la sesión), `eventosCliente.js` (SSE) y
  `consulta.js` (parámetros de listados).
- `utils/`: utilidades de formato y de traducción de errores.
- `styles/`: estilos globales de la aplicación.
- `App.jsx`: configuración de las rutas del frontend mediante React Router.
- `main.jsx`: punto de entrada de la aplicación React.

Las rutas del frontend son:

| Ruta | Página | Layout / acceso |
| ---- | ------ | --------------- |
| `/` | Inicio | `PublicLayout` |
| `/login` | Inicio de sesión | `PublicLayout` |
| `/registro` | Registro de usuario | `PublicLayout` |
| `/politica-datos` | Política de tratamiento de datos | `PublicLayout` |
| `/app` | Inicio del panel privado | `PrivateLayout`, requiere sesión |
| `/app/perfil` | Perfil del usuario | `PrivateLayout`, requiere sesión |
| `/app/habilidades` | Habilidades ofrecidas y requeridas | `PrivateLayout`, requiere sesión |
| `/app/buscar` | Búsqueda de usuarios | `PrivateLayout`, requiere sesión |
| `/app/usuarios/:id` | Detalle de otro usuario | `PrivateLayout`, requiere sesión |
| `/app/solicitudes` | Solicitudes de conexión | `PrivateLayout`, requiere sesión |
| `/app/conexiones` | Conexiones e intercambios | `PrivateLayout`, requiere sesión |
| `/app/mensajes` | Bandeja de conversaciones | `PrivateLayout`, requiere sesión |
| `/app/mensajes/:idConexion` | Chat de una conexión | `PrivateLayout`, requiere sesión |
| `/app/calificaciones` | Calificaciones de los intercambios | `PrivateLayout`, requiere sesión |
| `/admin` | Redirige a `/admin/categorias` | `AdminLayout`, rol administrador |
| `/admin/categorias` | Gestión de categorías | `AdminLayout`, rol administrador |
| `/admin/habilidades` | Gestión de habilidades | `AdminLayout`, rol administrador |
| `*` | Página no encontrada | Sin layout |

`ProtectedRoute` redirige a `/login` cuando no hay sesión y a `/app` cuando el
usuario autenticado no tiene el rol exigido. El frontend usa rutas relativas
(`/api/...`), así que funciona igual en desarrollo con el proxy de Vite y en
producción con el backend sirviendo el SPA.

La página `/politica-datos` explica qué datos trata la aplicación y está
enlazada desde el pie de página público. El esquema ya incluye las tablas
`politica_datos` y `aceptacion_politica`; el registro automático de la
aceptación todavía no está conectado a un endpoint, así que hoy la página es
informativa.

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

La migración `002_idx_mensaje_conexion_mensaje.sql` añade el índice `(id_conexion, id_mensaje)` que acelera el sondeo delta de la mensajería (`GET /api/mensajes?desde=`). Es opcional para el funcionamiento: sin ella las consultas siguen siendo correctas, solo más lentas cuando la tabla `mensaje` crezca. También es idempotente, así que se puede aplicar varias veces.

> Si usas npm 11 o superior, `npm run db:migrate -- --aplicar` puede descartar el argumento con un aviso `Unknown cli config "--aplicar"`. En ese caso ejecuta el script directamente: `node scripts/migrar.js --aplicar`.

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

### Calificaciones de los intercambios

Cuando una conexión se finaliza, cada participante puede calificar a la otra persona una sola vez. La calificación guarda una puntuación de 1 a 5 y un comentario opcional de hasta 500 caracteres.

Reglas de negocio:

- Solo se califica un intercambio `finalizada`; si la conexión sigue `activa` o está `bloqueada` la respuesta es `409`.
- El calificado no se envía desde el cliente: el backend lo deduce de la conexión, así que nunca se puede calificar a alguien con quien no hubo intercambio.
- Cada participante califica una sola vez por conexión (`409` si ya lo hizo); la clave única de la tabla respalda la regla ante envíos simultáneos.
- Calificar o consultar las calificaciones de una conexión ajena devuelve `404`.
- El resumen incluye `total`, `promedio` (dos decimales) y `distribucion` por puntuación. El promedio también aparece como `calificacion` en `GET /api/usuarios/:id` y `GET /api/usuarios/perfil`.

### Endpoints de calificaciones

| Método | Ruta                             | Protegido | Descripción                                                         |
| ------ | -------------------------------- | --------- | ------------------------------------------------------------------- |
| `POST` | `/api/calificaciones`            | Sí        | Califica a la otra persona de un intercambio finalizado             |
| `GET`  | `/api/calificaciones/usuario/:id` | Sí       | Lista las calificaciones recibidas por un usuario y su resumen      |
| `GET`  | `/api/calificaciones/conexion/:id` | Sí      | Lista las calificaciones de una conexión e indica si falta calificar |

El listado por usuario acepta `page` y `limit`; el listado por conexión devuelve como máximo dos calificaciones y el campo `puedeCalificar`, que es `true` cuando el intercambio terminó y el usuario autenticado todavía no calificó.

**Petición:**

```http
POST /api/calificaciones
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "idConexion": 7,
  "puntuacion": 5,
  "comentario": "Explicó con paciencia y llegó puntual."
}
```

**Respuesta `201 Created`:**

```json
{
  "success": true,
  "message": "Calificación registrada correctamente.",
  "data": {
    "idCalificacion": 12,
    "idConexion": 7,
    "calificador": {
      "idUsuario": 4,
      "nombres": "Ana",
      "apellidos": "Gómez",
      "alias": "anag"
    },
    "calificado": {
      "idUsuario": 8,
      "nombres": "Luis",
      "apellidos": "Pérez",
      "alias": "luisp"
    },
    "puntuacion": 5,
    "comentario": "Explicó con paciencia y llegó puntual.",
    "fechaCalificacion": "2026-11-13T10:00:00.000Z",
    "esPropia": true
  }
}
```

Al consultar las calificaciones recibidas, la respuesta agrega el resumen:

```json
{
  "success": true,
  "message": "Calificaciones consultadas correctamente.",
  "data": [],
  "resumen": {
    "total": 2,
    "promedio": 4.5,
    "distribucion": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 1 }
  },
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 2,
    "totalPaginas": 1,
    "tieneAnterior": false,
    "tieneSiguiente": false
  }
}
```

### Notificaciones en tiempo real (SSE)

El backend expone un canal **Server-Sent Events** para avisar de los cambios que le importan a cada usuario sin que el cliente tenga que preguntar cada pocos segundos. La notificación es siempre un **extra**: la base de datos es la única fuente de verdad y todo se puede recuperar con las rutas REST normales.

| Método | Ruta               | Protegido | Descripción                                              |
| ------ | ------------------ | --------- | -------------------------------------------------------- |
| `GET`  | `/api/eventos`       | Sí        | Abre el flujo SSE (`text/event-stream`)                   |
| `GET`  | `/api/eventos/feed`  | Sí        | Devuelve el resumen de notificaciones en formato REST     |

`GET /api/eventos` no consulta la base de datos: responde con los encabezados del flujo, la espera de reconexión (`retry: 5000`) y un evento `conectado`. El cliente pide el estado con `GET /api/eventos/feed` (al conectar y cada vez que recibe un evento `feed`).

El feed se **deriva** de datos existentes, sin tabla de notificaciones: solicitudes pendientes recibidas, mensajes sin leer agrupados por conexión e intercambios finalizados que el usuario todavía no calificó.

```json
{
  "success": true,
  "message": "Feed de notificaciones consultado correctamente.",
  "data": {
    "actualizadoEn": "2026-11-12T15:30:00.000Z",
    "total": 3,
    "solicitudesPendientes": {
      "total": 1,
      "items": [
        {
          "idSolicitud": 12,
          "emisor": { "idUsuario": 4, "nombres": "Ana", "apellidos": "Gómez", "alias": "anag" },
          "mensajeInicial": "Vi que también enseñas guitarra.",
          "fechaEnvio": "2026-11-12T14:00:00.000Z"
        }
      ]
    },
    "mensajesNoLeidos": {
      "total": 2,
      "porConexion": [{ "idConexion": 7, "total": 2 }]
    },
    "pendientesDeCalificar": {
      "total": 0,
      "items": []
    }
  }
}
```

Eventos que puede enviar el flujo, todos con `data` en JSON:

| Evento        | Cuándo se emite                                        | `data` mínimo                                        |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| `conectado`   | Al abrir el flujo                                      | `idUsuario`, `intervaloLatidoMs`                     |
| `mensaje`     | Otro participante escribe en una conexión activa       | `idMensaje`, `idConexion`, `remitente`, `contenido`, `fechaEnvio` |
| `solicitud`   | Se crea, acepta, rechaza o cancela una solicitud       | `idSolicitud`, `estado` (`idConexion` al aceptar)    |
| `conexion`    | El interlocutor finaliza el intercambio                | `idConexion`, `estado`, `fechaInicio`                |
| `calificacion`| La otra persona califica el intercambio                | `idCalificacion`, `idConexion`, `puntuacion`, `calificador` |
| `feed`        | Cambió el feed del usuario                             | `motivo` (`mensaje`, `solicitud`, `conexion`, `calificacion`) |

Ejemplo de trama recibida al enviar un mensaje:

```text
event: mensaje
data: {"idMensaje":31,"idConexion":7,"remitente":{"idUsuario":4,"nombres":"Ana","apellidos":"Gómez","alias":"anag"},"contenido":"Hola","fechaEnvio":"2026-11-12T15:30:00.000Z"}
```

Detalles de la implementación y limitaciones asumidas:

- **Token en la query.** `EventSource` no permite enviar encabezados, así que el flujo se autentica con `GET /api/eventos?token=<jwt>`. Es la única opción con SSE, pero el token queda en los logs de acceso. Mitigación recomendada al desplegar: desactivar el registro de la query string, servir HTTPS y valorar una cookie `httpOnly` o un token de corta vida para el flujo.
- **Latido cada 30 segundos.** Cada conexión recibe un comentario `: ping` para que proxies y balanceadores no la corten por inactividad. El intervalo se limpia al cerrar la conexión y no mantiene vivo el proceso.
- **Limpieza al cerrar.** Cuando el cliente corta el flujo se borra su suscripción y se detiene el latido, así que el registro en memoria no crece. Las conexiones que ya no aceptan escrituras se descartan en el momento de emitir.
- **Máximo 3 conexiones por usuario.** Por encima se responde `429`. Con HTTP/1.1 el navegador limita a unas 6 conexiones por dominio, así que conviene abrir **una sola** conexión por usuario y compartirla entre pestañas con `BroadcastChannel` (o mover el envío a un *service worker*). Si se necesita más, habría que reconsiderar WebSocket.
- **Unidireccional.** SSE solo permite servidor → cliente; los envíos siguen siendo `POST` normales. **No se ha podido verificar si el host de despliegue sirve HTTP/2**; se asume HTTP/1.1, donde el límite de conexiones del navegador es el descrito arriba.
- **Escalamiento.** El registro de conexiones vive en el proceso. Con varias instancias habría que emitir a través de un bus compartido (por ejemplo Redis pub/sub); con una sola instancia es suficiente.
- **Alternativa por sondeo delta.** Un cliente que no pueda usar `EventSource` puede preguntar `GET /api/eventos/feed` cada cierto tiempo y, para la conversación abierta, `GET /api/mensajes?conexionId=7&desde=<idMensaje>`: devuelve solo los mensajes posteriores a ese `idMensaje`, sin paginación y como máximo 50 por consulta (si hay más, se repite con el id más alto recibido).


### Variables de entorno del backend

Además de las variables de conexión a la base de datos, el backend utiliza las siguientes variables:

```env
PORT=3000
HOST=0.0.0.0
DB_SSL=false
JWT_SECRET=cambia_esta_clave_en_produccion
JWT_EXPIRES_IN=1h
```

| Variable | Obligatoria | Valor por defecto | Descripción |
| -------- | ----------- | ----------------- | ----------- |
| `PORT` | No | `3000` | Puerto en el que escucha el servidor. Railway lo inyecta automáticamente. |
| `HOST` | No | `0.0.0.0` | Interfaz de escucha. `0.0.0.0` permite el acceso desde fuera del contenedor; `127.0.0.1` restringe el acceso a la máquina local. |
| `DB_SSL` | No | Sin TLS | TLS de la conexión a MySQL. Vacío o `false` lo desactiva; `true`/`required` lo activa sin validar el certificado (lo que necesita un MySQL gestionado con certificado autofirmado); `verify`/`strict` lo activa validando el certificado. Un valor desconocido impide el arranque. |
| `JWT_SECRET` | Sí | — | Clave secreta para firmar y verificar los tokens. Mínimo 16 caracteres; si falta o es demasiado corta, el backend no arranca y muestra exactamente qué variable corregir. |
| `JWT_EXPIRES_IN` | No | `1h` | Tiempo de expiración del token en el formato de `jsonwebtoken` (`30m`, `1h`, `7d`). |

Con `NODE_ENV=production` y la conexión sin TLS el arranque muestra una advertencia, porque la mayoría de los MySQL gestionados exigen SSL. Si la conexión falla por TLS, `testDatabaseConnection()` lo indica y sugiere revisar `DB_SSL`. La validación completa vive en `backend/src/config/env.js` y se ejecuta al arrancar.

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

- Validación de la configuración del entorno (`tests/config/env.test.js`): variables obligatorias, puertos, `JWT_SECRET` y `JWT_EXPIRES_IN`, mensajes de error agregados, `HOST` (valor por defecto `0.0.0.0` y valor personalizado), las variantes de `DB_SSL` (desactivado, `true`, `verify` y valor inválido) y la advertencia de producción sin TLS.
- Autenticación (`tests/middlewares/autenticacion.test.js`): formato del encabezado `Authorization`, tokens válidos, expirados, firmados con otro secreto o sin firma, autorización de administrador y el token por query de SSE (`autenticarEvento`: ausente, vacío, repetido, inválido y válido con espacios).
- Manejo de errores (`tests/middlewares/errorHandler.test.js`) y rutas inexistentes (`tests/middlewares/notFound.test.js`).
- Validaciones de entrada de los módulos (`tests/modules/validaciones.test.js`), incluidos los campos extendidos del perfil (`biografia`, `fotoPerfilUrl`, `disponibilidad`, `ciudad`, `pais`). Las habilidades del usuario tienen su propio archivo (`tests/modules/habilidades-usuario.validation.test.js`): niveles, estados, textos libres, actualizaciones parciales e identificadores. Las solicitudes de conexión (`tests/modules/solicitudes.validation.test.js`), las conexiones (`tests/modules/conexiones.validation.test.js`), la mensajería (`tests/modules/mensajes.validation.test.js`) y las calificaciones (`tests/modules/calificaciones.validation.test.js`) cubren el receptor, el mensaje inicial, el contenido de los mensajes, la puntuación, el comentario, los filtros de estado y los identificadores.
- Utilidades de listados (`tests/utils/consulta.test.js`): valores por defecto de `page` y `limit`, metadatos de paginación y validación de filtros de texto, identificadores y valores cerrados (`estado`, `orden`).
- Integración HTTP básica (`tests/app.test.js`): se levanta la aplicación en un puerto libre y se comprueban respuestas reales de rutas que no consultan la base de datos, incluido el 401/403 de las escrituras del catálogo, el 400 de las validaciones, el 400 de los filtros de los listados (`page`, `limit`, `estado`, `orden`, `habilidadOfrecida`, `conexionId`, `desde`), el 401 de las ocho rutas de habilidades del usuario, el 401 de las diez rutas de solicitudes y conexiones, el 401 de las cuatro rutas de mensajería, el 401 de las dos rutas de eventos y el 401 de las tres rutas de calificaciones. También se abre un flujo SSE real: se comprueban los encabezados, el evento `conectado`, el límite de conexiones (`429`) y que la suscripción se libera al cerrar el cliente. Además se verifica el *fallback* del SPA cuando existe `frontend/dist`: una ruta de React Router con `Accept: text/html` devuelve `index.html` con `Cache-Control: no-cache`, mientras que sin ese encabezado (o bajo `/api/...`) la respuesta sigue siendo el 404 en JSON.
- Apagado ordenado (`tests/apagado.test.js`): orden de cierre (eventos SSE → servidor HTTP → conexiones inactivas → pool de MySQL), funcionamiento cuando el servidor no llegó a arrancar, idempotencia ante una segunda señal, tolerancia a fallos del pool, salida forzada cuando algo se cuelga y código de salida distinto de cero en ese caso.
- Eventos en tiempo real (`tests/modules/eventos.registro.test.js`): entrega de eventos al destinatario, formato de las tramas, latido con temporizadores simulados (a los 30 segundos y detenido al cerrar), límite de conexiones por usuario y descarte de conexiones muertas.

La suite completa suma 213 casos y no necesita MySQL en ejecución. Si una prueba falla, `npm test` termina con código de salida distinto de cero.

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

## Pruebas del módulo de mensajería y calificaciones

Desde Postman se pueden realizar las siguientes pruebas con dos usuarios conectados y una conexión aceptada:

1. Enviar un mensaje con `POST /api/mensajes` indicando `idConexion` y `contenido`.
2. Listar la conversación con `GET /api/mensajes?conexionId=<id>` y comprobar el orden cronológico y el campo `esPropio`.
3. Consultar `GET /api/mensajes/no-leidos` y `GET /api/conexiones` para ver el contador `noLeidos`.
4. Marcar los mensajes recibidos con `PATCH /api/mensajes/leidos` y comprobar que `actualizados` sea mayor que cero.
5. Repetir la marca de lectura (debe devolver `actualizados: 0`) y enviar un mensaje a una conexión finalizada (debe responder `409`).
6. Intentar enviar, listar o marcar mensajes con el token de un tercero y comprobar que respondan `404`.
7. Finalizar la conexión con `PATCH /api/conexiones/:id/finalizar` antes de calificar.
8. Calificar con `POST /api/calificaciones` indicando `idConexion`, `puntuacion` (1 a 5) y un `comentario` opcional.
9. Repetir la calificación (debe responder `409`) y calificar mientras la conexión está activa (debe responder `409`).
10. Consultar `GET /api/calificaciones/conexion/:id` para ver las dos calificaciones y el campo `puedeCalificar`.
11. Consultar `GET /api/calificaciones/usuario/:id` y comprobar `resumen.promedio`, `resumen.total` y `resumen.distribucion`.
12. Verificar que `GET /api/usuarios/:id` y `GET /api/usuarios/perfil` incluyan `calificacion` con el promedio y el total.
13. Enviar `puntuacion` fuera de rango, `idCalificado` o `page=0` y comprobar que la API responda `400`.
14. Verificar que las siete rutas respondan `401` cuando no se envía el token.

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
2. Ejecuta `database/shema.sql` para crear las tablas (incluye la restricción única de habilidades por categoría y el índice `idx_mensaje_conexion_mensaje` de la mensajería).
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
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=skillmatch
DB_SSL=false
JWT_SECRET=una_clave_larga_y_dificil_de_adivinar
JWT_EXPIRES_IN=1h
```

`DB_SSL` se deja vacío o en `false` con un MySQL local y se pone en `true` cuando el servidor exige TLS (por ejemplo, el MySQL de Railway). El resto de modos se describen en [Variables de entorno del backend](#variables-de-entorno-del-backend).

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

## Despliegue en producción (un solo servicio)

En producción el frontend no se sirve con `vite preview`: el backend sirve la API y el SPA compilado desde el mismo origen. Así no hay CORS ni `VITE_API_URL`, y el flujo SSE viaja por el mismo dominio.

Archivos que intervienen:

| Archivo | Para qué sirve |
| ------- | -------------- |
| `Dockerfile` | Imagen de producción en tres etapas: compila el frontend, instala las dependencias del backend sin `devDependencies` y arma la imagen final (`node:22-alpine`, usuario `node`). |
| `railway.json` | Configura Railway: constructor `DOCKERFILE`, arranque `node backend/src/server.js`, *healthcheck* en `/api/health` (120 s) y reinicio `ON_FAILURE`. |
| `.dockerignore` | Deja fuera del contexto `node_modules`, `dist`, `.git`, `.env*` y la documentación. |
| `Documentation/DESPLIEGUE_RAILWAY.md` | Guía paso a paso: crear el proyecto, añadir MySQL, definir variables, aplicar migraciones y resolver problemas. |

Qué hace `backend/src/app.js` cuando existe `frontend/dist`:

1. Sirve `index.html` y el resto de archivos con `express.static` (`index: false`).
2. Envía `Cache-Control: public, max-age=31536000, immutable` solo a `/assets/*`, porque Vite añade un hash al nombre de cada archivo.
3. Devuelve `index.html` con `Cache-Control: no-cache` para cualquier `GET`/`HEAD` que pida HTML y no empiece por `/api`: así funcionan las rutas de React Router (`/app/mensajes/7`, `/politica-datos`, ...) al recargar o al entrar por enlace directo.
4. Deja que `/api/...` y el resto de peticiones sigan su curso normal, de modo que una ruta inexistente sigue respondiendo el 404 en JSON.

Si `frontend/dist` no existe (por ejemplo, al trabajar con dos servidores en desarrollo), el backend arranca como API pura y avisa por consola.

Variables de entorno en el servicio:

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_SSL=true
JWT_SECRET=<clave-de-32-bytes-en-hexadecimal>
JWT_EXPIRES_IN=1h
```

No se define `PORT`: la plataforma lo inyecta. `NODE_ENV` ya vale `production` dentro de la imagen y `HOST` conserva su valor por defecto `0.0.0.0`.

Arranque y apagado ordenado:

- Al recibir `SIGTERM` (lo envía la plataforma al desplegar o al dormir el servicio) o `SIGINT`, el backend deja de aceptar peticiones, cierra los flujos SSE, cierra el servidor HTTP, espera a que el pool de MySQL termine y sale con código 0. Si algo tarda más de 10 segundos, fuerza la salida.
- `GET /api/health` es el *healthcheck*: responde sin consultar la base de datos, así que la plataforma puede reanudar el servicio tras una pausa sin esperar a MySQL.
- El registro de conexiones SSE está en memoria, así que en el plan gratuito de Railway (una réplica) es suficiente; no se debe escalar horizontalmente sin un bus compartido.

Migraciones y datos iniciales en la base gestionada:

```bash
cd backend
npm run db:migrate -- --aplicar
```

El comando usa las mismas variables `DB_*` del archivo `.env` local apuntando (con `DB_SSL=true`) a la base del proveedor. Para cargar roles y el catálogo inicial se ejecuta `database/seed.sql` con el cliente de MySQL.

La guía completa, incluida la alternativa sin Docker (Nixpacks), está en `Documentation/DESPLIEGUE_RAILWAY.md`.

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

En `md` y superiores, `PrivateLayout` y `AdminLayout` muestran la barra horizontal de enlaces. Por debajo de `md` esa barra se oculta y aparece `MenuMovil`: un botón de hamburguesa que abre un panel con los mismos enlaces y que se cierra al elegir uno, al tocar fuera o con `Escape` (devolviendo el foco al botón).

## Accesibilidad

La interfaz debe cumplir las siguientes reglas:

- Contraste mínimo de 4.5:1 para texto normal.
- Áreas táctiles de al menos 44 x 44 px.
- Etiquetas asociadas a cada campo de formulario.
- Texto alternativo en imágenes mediante el atributo `alt`.
- Navegación por teclado en formularios, botones y modales.
- Menú móvil operable con teclado: `aria-expanded`, `aria-controls`, texto para lectores de pantalla y cierre con `Escape` devolviendo el foco al botón.
- Indicadores de carga durante operaciones con espera.
- Validación en el cliente para mejorar la experiencia y validación en el servidor como fuente de verdad.

## Autor

Diego Alejandro Santander Toro  
Programa: Análisis y Desarrollo de Software  
Proyecto formativo: SkillMatch