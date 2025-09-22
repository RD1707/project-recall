FROM node:18-alpine AS base

RUN apk update && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS dev
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
CMD ["dumb-init", "npm", "run", "dev"]

FROM base AS build
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

RUN chown -R nodejs:nodejs /app
USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3001
CMD ["dumb-init", "node", "dist/server.js"]