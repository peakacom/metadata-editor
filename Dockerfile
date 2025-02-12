FROM node:23-slim AS build
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build


FROM node:23-slim AS runtime
WORKDIR /app

COPY --from=build --chown=1001:1001 /app/.next ./.next
COPY --from=build --chown=1001:1001 /app/node_modules ./node_modules

EXPOSE 3000

CMD [ "next", "start" ]
