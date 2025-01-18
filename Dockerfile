FROM node:22-alpine AS build

WORKDIR /build

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

COPY common common

COPY server server
RUN npm run -w server build

COPY client client
RUN npm run -w client build

RUN npm prune --omit=dev

#################################################

FROM node:22-alpine

WORKDIR /app

COPY --from=build /build/node_modules node_modules
COPY --from=build /build/package.json package.json
COPY --from=build /build/dist dist
COPY --from=build /build/public public

CMD [ "node", "dist/server.js" ]
