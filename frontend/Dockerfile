# Multi-stage build for optimized frontend
FROM node:18-alpine AS base

# Install security updates
RUN apk update && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Development stage
FROM base AS dev
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
EXPOSE 5173
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS prod

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && adduser -S nginx -u 1001 -G nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]