#################################################
FROM node:22-alpine AS frontend

WORKDIR /build/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

WORKDIR /build
COPY common common

WORKDIR /build/client
COPY client/src src
COPY client/tsconfig.json tsconfig.json
COPY client/vite.config.ts vite.config.ts
RUN npm run build

#################################################
FROM node:22-alpine AS backend

WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci

WORKDIR /build
COPY common common

WORKDIR /build/server
COPY server/src src
COPY server/tsconfig.json tsconfig.json
COPY server/build.ts build.ts
RUN npm run build
RUN npm prune --omit=dev

#################################################
FROM node:22-alpine

WORKDIR /app

COPY --from=backend /build/server/node_modules node_modules
COPY --from=backend /build/server/package.json package.json
COPY --from=backend /build/server/dist dist
COPY --from=frontend /build/client/dist public

CMD [ "node", "dist/server.js" ]
