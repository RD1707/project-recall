# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install security updates and required dependencies
RUN apk update && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory and user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
WORKDIR /app

# Install dependencies (separate layer for caching)
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
CMD ["dumb-init", "npm", "run", "dev"]

# Production build stage
FROM base AS build
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

# Production stage
FROM base AS prod
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/server.js ./
COPY --from=build /app/package.json ./

# Security: run as non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3001
CMD ["dumb-init", "node", "server.js"]