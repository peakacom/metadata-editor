FROM node:23-alpine AS build
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build


FROM node:23-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001 -G nodejs

COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules

EXPOSE 3000
USER nextjs

CMD [ "next", "start" ]
