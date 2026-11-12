# Despliegue en Railway (un solo servicio, trial de $5)

SkillMatch se despliega como **un único servicio**: el proceso de Express sirve
la API (`/api/...`) y la SPA compilada (`frontend/dist`). Al compartir origen no
hacen falta CORS ni `VITE_API_URL`.

```
Navegador ──HTTPS──> [ Servicio Railway: Express + frontend/dist ] ──> [ MySQL de Railway ]
```

## 1. Archivos que hacen posible el despliegue

| Archivo | Para qué |
| --- | --- |
| `Dockerfile` | 3 etapas: `vite build` del frontend, dependencias de producción del backend y la imagen final con ambos. |
| `railway.json` | Le dice a Railway que construya con el `Dockerfile`, que el arranque es `node backend/src/server.js` y que el healthcheck es `/api/health`. |
| `.dockerignore` | Evita enviar `node_modules`, `dist`, `.env` y documentación al contexto de build. |
| `backend/src/server.js` | Escucha en `HOST` (0.0.0.0) y `PORT`, y hace el apagado ordenado. |
| `backend/src/app.js` | Sirve `frontend/dist` y aplica el fallback de React Router. |

El comando de build **no** hay que configurarlo a mano: lo ejecuta el Dockerfile
en este orden.

```dockerfile
RUN npm ci                      # frontend
RUN npm run build               # frontend -> dist/
RUN npm ci --omit=dev           # backend
CMD ["node", "backend/src/server.js"]
```

## 2. Pasos en Railway

1. **Nuevo proyecto** → *Deploy from GitHub repo* → elegir el repositorio.
   Railway detecta `railway.json` y usa el `Dockerfile`.
2. **Añadir la base de datos**: *New* → *Database* → *MySQL*.
3. En el servicio web → *Variables*, definir (los valores con `${{...}}` se
   enlazan solos a la base de datos del proyecto):

   | Variable | Valor |
   | --- | --- |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | cadena aleatoria de 32+ caracteres |
   | `JWT_EXPIRES_IN` | `7d` (o `1h`) |

   - **No definas `PORT`**: Railway lo inyecta y espera que el proceso lo use.
   - `HOST` es opcional; por defecto es `0.0.0.0`, que es lo obligatorio en
     contenedores (con `127.0.0.1` el proxy de Railway no alcanza el proceso).
   - Genera el secreto con:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

4. **Dominio**: *Settings* → *Networking* → *Generate Domain*.
   La app queda en `https://<servicio>.up.railway.app`.
5. **Verificar**: `/api/health` debe devolver `{"success":true,...}`, y `/`
   y `/politica-datos` deben cargar la SPA (no un 404).

## 3. Cargar el esquema y los datos

Las migraciones se ejecutan **desde tu máquina** apuntando a la base de Railway
(el contenedor sólo lleva el runtime). Usa las credenciales públicas
(*MySQL* → *Connect* → *Public Network*) o `MYSQL_PUBLIC_URL`.

```powershell
cd backend
$env:DB_HOST="<host público>"; $env:DB_PORT="<puerto público>"
$env:DB_NAME="railway"; $env:DB_USER="root"; $env:DB_PASSWORD="<password>"
$env:DB_SSL="true"
npm run db:migrate -- --aplicar
```

Para los datos de ejemplo (`database/seed.sql`) usa el cliente `mysql`:

```powershell
mysql --host=<host público> --port=<puerto público> --user=root --password `
      --ssl-mode=REQUIRED railway < ..\database\seed.sql
```

## 4. Qué hace el proceso al arrancar y al apagarse

Al arrancar: valida las variables (si falta `JWT_SECRET` o `DB_PASSWORD`, el
proceso no inicia y el log dice exactamente cuál), comprueba la conexión con
MySQL y avisa por consola si `frontend/dist` no existe.

Al recibir `SIGTERM` (lo que envía Railway en cada redeploy):

1. `cerrarTodos()` → cierra las conexiones SSE (`/api/eventos`). Sin esto,
   `server.close()` esperaría para siempre porque un SSE nunca termina solo.
2. `server.close()` + `closeIdleConnections()` → deja de aceptar peticiones y
   espera a las que están en curso.
3. `pool.end()` → libera las conexiones a MySQL.
4. Si algo se cuelga, un temporizador de 10 s fuerza la salida.

## 5. Limitaciones del plan trial (una sola instancia)

- El registro de SSE vive **en memoria** (`eventos.registro.js`): no escala a
  varias réplicas ni a *sleep* del servicio. Deja **1 réplica**.
- El trial de $5 se consume por tiempo de ejecución: si el servicio queda
  inactivo, Railway lo duerme; la primera petición tarda unos segundos en
  despertarlo (el `healthcheckTimeout` de `railway.json` es 120 s para cubrirlo).
- El disco es efímero: nada de escribir archivos en el contenedor; la única
  fuente de verdad es MySQL.

## 6. Alternativa sin Dockerfile (Nixpacks)

Si preferís que Railway construya sin Docker, poné en *Settings* → *Build*:

- **Build command**:
  `npm --prefix backend ci && npm --prefix frontend ci && npm run build --prefix frontend`
- **Start command**: `node backend/src/server.js`

Funciona igual, pero el `Dockerfile` es más determinista (fija Node 22 y separa
las dependencias de producción) y es la ruta que usa `railway.json`.
