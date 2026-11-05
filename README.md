# SkillMatch

SkillMatch es una plataforma web orientada al intercambio no monetario de conocimientos y habilidades. Permite que las personas publiquen habilidades que pueden enseñar, registren habilidades que desean aprender, busquen coincidencias, envíen solicitudes de conexión, se comuniquen y califiquen las experiencias de intercambio.

Actualmente, el proyecto implementa los módulos de gestión de categorías, gestión de habilidades, autenticación y usuarios en el backend. Estos módulos exponen APIs REST conectadas a una base de datos MariaDB y permiten administrar el catálogo de áreas de conocimiento, las habilidades asociadas a cada categoría, el registro de usuarios, el inicio de sesión y la consulta o actualización del perfil del usuario autenticado.

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
│   ├── src/
│   │   ├── config/
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
│   │   │   └── usuarios/
│   │   │       ├── usuarios.controller.js
│   │   │       ├── usuarios.repository.js
│   │   │       ├── usuarios.routes.js
│   │   │       ├── usuarios.service.js
│   │   │       └── usuarios.validation.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   └── scripts SQL
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

| Método   | Ruta                  | Descripción             |
| -------- | --------------------- | ----------------------- |
| `GET`    | `/api/categorias`     | Lista las categorías    |
| `POST`   | `/api/categorias`     | Crea una categoría      |
| `PUT`    | `/api/categorias/:id` | Actualiza una categoría |
| `DELETE` | `/api/categorias/:id` | Elimina una categoría   |

### Gestión de habilidades

El módulo de habilidades permite administrar el catálogo de habilidades asociadas a las categorías de conocimiento. Cada habilidad pertenece a una categoría y puede ser utilizada posteriormente por los usuarios para registrar las habilidades que ofrecen o desean aprender.

El módulo permite:

- Listar todas las habilidades registradas.
- Listar las habilidades asociadas a una categoría específica.
- Consultar una habilidad por su identificador.
- Crear una nueva habilidad asociada a una categoría existente.
- Actualizar una habilidad existente.
- Eliminar una habilidad.
- Validar que la categoría indicada exista.
- Evitar que se registre una habilidad duplicada dentro de la misma categoría.
- Mostrar mensajes de éxito o error según el resultado de cada operación.

### Endpoints del módulo de habilidades

| Método   | Ruta                             | Descripción                                       |
| -------- | -------------------------------- | ------------------------------------------------- |
| `GET`    | `/api/habilidades`               | Lista todas las habilidades                       |
| `GET`    | `/api/habilidades?categoriaId=1` | Lista las habilidades de una categoría específica |
| `GET`    | `/api/habilidades/:id`           | Consulta una habilidad por su identificador       |
| `POST`   | `/api/habilidades`               | Crea una habilidad                                |
| `PUT`    | `/api/habilidades/:id`           | Actualiza una habilidad                           |
| `DELETE` | `/api/habilidades/:id`           | Elimina una habilidad                             |

### Ejemplo de creación de habilidad

**Petición:**

```http
POST /api/habilidades
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

### Restricción recomendada

Para evitar habilidades duplicadas dentro de una misma categoría, se ejecutó la siguiente restricción en la base de datos:

```sql
ALTER TABLE habilidad
ADD CONSTRAINT uq_habilidad_nombre_categoria
UNIQUE (id_categoria, nombre);
```

Esta restricción permite que exista una habilidad con el mismo nombre en categorías diferentes, pero impide duplicarla dentro de una misma categoría.

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

| Método | Ruta                   | Protegido | Descripción                                   |
| ------ | ---------------------- | --------- | --------------------------------------------- |
| `GET`  | `/api/usuarios/perfil` | Sí        | Consulta el perfil del usuario autenticado    |
| `PUT`  | `/api/usuarios/perfil` | Sí        | Actualiza el perfil del usuario autenticado   |
| `GET`  | `/api/usuarios/:id`    | No        | Consulta la información pública de un usuario |

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
    "id_usuario": 1,
    "id_rol": 2,
    "rol": "usuario",
    "nombres": "Diego",
    "apellidos": "Santander",
    "correo_electronico": "diego@example.com",
    "alias": "diegosantander",
    "estado_cuenta": "activo",
    "fecha_registro": "2026-11-05T20:00:00.000Z",
    "biografia": null,
    "foto_perfil_url": null,
    "disponibilidad": null,
    "ciudad": null,
    "pais": null
  }
}
```

### Variables de entorno de autenticación

Además de las variables de conexión a la base de datos, el backend utiliza las siguientes variables:

```env
JWT_SECRET=cambia_esta_clave_en_produccion
JWT_EXPIRES_IN=1h
```

- `JWT_SECRET`: clave secreta utilizada para firmar y verificar los tokens.
- `JWT_EXPIRES_IN`: tiempo de expiración del token.

Estas variables no deben compartirse ni subirse al repositorio.

## Pruebas del módulo de categorías

Desde el frontend se pueden realizar las siguientes pruebas:

1. Abrir la sección de categorías.
2. Verificar que la lista cargue correctamente.
3. Crear una categoría nueva.
4. Editar una categoría existente.
5. Eliminar una categoría mediante el diálogo de confirmación.
6. Comprobar que la tabla se actualice después de cada operación.

## Pruebas del módulo de habilidades

Desde Postman se pueden realizar las siguientes pruebas:

1. Listar todas las habilidades.
2. Listar habilidades filtradas por categoría mediante el parámetro `categoriaId`.
3. Consultar una habilidad por su identificador.
4. Crear una habilidad asociada a una categoría existente.
5. Intentar crear una habilidad sin categoría o con una categoría inexistente.
6. Intentar crear una habilidad duplicada dentro de la misma categoría.
7. Actualizar una habilidad existente.
8. Eliminar una habilidad.
9. Verificar que la lista se actualice correctamente después de cada operación.

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
9. Consultar la información pública de un usuario mediante `GET /api/usuarios/:id`.
10. Verificar que las rutas protegidas rechacen peticiones con un token inválido o expirado.

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
2. Ejecuta los scripts SQL ubicados en la carpeta `database/`.
3. Copia el archivo `.env.example` como `.env` dentro de `backend/`.
4. Configura las credenciales de tu base de datos.

Ejemplo de variables de entorno:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=skillmatch
```

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