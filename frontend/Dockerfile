# ==============================================================================
# BengkelKu Frontend - Dockerfile
# Multi-stage build: Build Vue → Serve dengan Nginx
# ==============================================================================

# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Build Vue 3 Application
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package files dan install dependensi
COPY package*.json ./
RUN npm ci

# Copy seluruh source code
COPY . .

# Build production bundle (output ke /app/dist)
RUN npm run build


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Serve dengan Nginx (image sangat ringan)
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS production-stage

# Hapus konfigurasi default Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy konfigurasi Nginx reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build Vue dari stage sebelumnya
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
