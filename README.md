# SkillMatch

SkillMatch es una plataforma web orientada al intercambio no monetario de conocimientos y habilidades. Permite que las personas publiquen habilidades que pueden enseñar, registren habilidades que desean aprender, busquen coincidencias, envíen solicitudes de conexión, se comuniquen y califiquen las experiencias de intercambio.

Actualmente, el proyecto implementa el módulo de gestión de categorías, que permite listar, crear, actualizar y eliminar categorías de conocimiento desde el frontend, mediante una API conectada a una base de datos MariaDB.

## Tecnologías utilizadas

- JavaScript
- React
- Vite
- Node.js
- Express
- MariaDB / MySQL
- Tailwind CSS v4
- Inter, como tipografía principal

## Estructura del repositorio

```text
SkillMatch/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
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
- `modules/`: funcionalidades agrupadas por dominio. Actualmente contiene el
  módulo de categorías y sus componentes, validaciones y peticiones a la API.
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

## Módulo implementado

### Gestión de categorías

El módulo permite:

- Listar las categorías registradas.
- Crear una nueva categoría.
- Actualizar una categoría existente.
- Eliminar una categoría.
- Mostrar mensajes de éxito o error según el resultado de cada operación.
- Confirmar la eliminación mediante un diálogo de confirmación.

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

## Endpoints del módulo de categorías

| Método   | Ruta                  | Descripción             |
| -------- | --------------------- | ----------------------- |
| `GET`    | `/api/categorias`     | Lista las categorías    |
| `POST`   | `/api/categorias`     | Crea una categoría      |
| `PUT`    | `/api/categorias/:id` | Actualiza una categoría |
| `DELETE` | `/api/categorias/:id` | Elimina una categoría   |

## Pruebas del módulo

Desde el frontend se pueden realizar las siguientes pruebas:

1. Abrir la sección de categorías.
2. Verificar que la lista cargue correctamente.
3. Crear una categoría nueva.
4. Editar una categoría existente.
5. Eliminar una categoría mediante el diálogo de confirmación.
6. Comprobar que la tabla se actualice después de cada operación.

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