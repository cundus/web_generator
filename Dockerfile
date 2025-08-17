# ---- Base builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for native deps (optional but safe)
RUN apk add --no-cache python3 make g++

# Only copy manifests first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
# (Add any other runtime assets you copy to dist, e.g. ./prisma, ./public)
RUN npm run build

# ---- Runtime (slim) ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring compiled JS
COPY --from=builder /app/dist ./dist
# Copy runtime assets if your app needs them at runtime (uncomment as needed)
# COPY --from=builder /app/public ./public

# Non-root for safety
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
