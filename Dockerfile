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
COPY --from=build --chown=nextjs:nodejs /app/public ./public

COPY --from=build --chown=nextjs:nodejs /app/package.json ./
COPY --from=build --chown=nextjs:nodejs /app/package-lock.json ./

EXPOSE 3000
USER nextjs

CMD ["npm", "run", "start"]
