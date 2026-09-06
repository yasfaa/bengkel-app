# ==============================================================================
# BengkelKu Backend - Dockerfile
# ==============================================================================
# Build command: docker build -t bengkelku-backend .
# ==============================================================================

# Stage 1: Install Dependencies & Generate Prisma Client
FROM node:20-alpine AS deps-stage
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate


# ==============================================================================
# Stage 2: Production Image
# ==============================================================================
FROM node:20-alpine AS production-stage
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed dependencies and generated Prisma client from deps stage
COPY --from=deps-stage /app/node_modules ./node_modules
COPY --from=deps-stage /app/prisma ./prisma

# Copy application source code
COPY src ./src

# Set correct ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/index.js"]
