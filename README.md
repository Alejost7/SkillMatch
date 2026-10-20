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
- Tailwind CSS

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
    │   ├── modules/
    │   └── main.jsx
    └── package.json
```

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

## Autor

Diego Alejandro Santander Toro  
Programa: Análisis y Desarrollo de Software  
Proyecto formativo: SkillMatch