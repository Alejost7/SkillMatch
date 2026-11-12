# Imagen de producción de SkillMatch: un único servicio.
#
# Express sirve la API (/api/...) y la SPA compilada (/frontend/dist), así que
# el navegador habla con un solo origen y no hace falta configurar CORS ni
# variables VITE_API_URL.
#
# Etapas:
#   1. build-frontend -> instala dependencias y ejecuta `vite build`
#   2. deps-backend   -> sólo dependencias de producción del backend
#   3. produccion     -> imagen final con backend/src + frontend/dist

FROM node:22-alpine AS build-frontend

WORKDIR /build/frontend

# Las dependencias se copian aparte para aprovechar la caché de capas: mientras
# no cambie package-lock.json, `npm ci` no se vuelve a ejecutar.
COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


FROM node:22-alpine AS deps-backend

WORKDIR /build/backend

COPY backend/package.json backend/package-lock.json ./

RUN npm ci --omit=dev


FROM node:22-alpine AS produccion

# NODE_ENV=production es lo que activó el aviso de DB_SSL y desactiva las
# optimizaciones de desarrollo de Express.
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=deps-backend /build/backend/node_modules ./backend/node_modules
COPY backend/package.json ./backend/package.json
COPY backend/src ./backend/src

# app.js resuelve la SPA como backend/src/../../frontend/dist -> /app/frontend/dist
COPY --from=build-frontend /build/frontend/dist ./frontend/dist

# La imagen node ya incluye el usuario sin privilegios `node`.
USER node

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
