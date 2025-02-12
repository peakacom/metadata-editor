FROM node:23-slim AS build
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build


FROM node:23-slim AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S nextjs
RUN adduser -S nextjs -u 1001

COPY --from=build --chown=nextjs:nextjs /app/.next ./.next
COPY --from=build --chown=nextjs:nextjs /app/node_modules ./node_modules

EXPOSE 3000
USER nextjs

CMD [ "next", "start" ]
