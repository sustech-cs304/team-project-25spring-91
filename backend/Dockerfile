# STAGE 1: Builder
FROM --platform=linux/amd64 node:18-slim AS builder
WORKDIR /app

# Install system dependencies (only need these for sharp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# Simple clean install - no need for separate prod/dev installs
RUN npm ci

COPY . .
RUN npx prisma generate

# Clean up dev dependencies
RUN npm prune --production

# STAGE 2: Runner
FROM --platform=linux/amd64 node:18-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips42 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=${PORT:-5000}

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/src ./src

USER nodejs
EXPOSE ${PORT}
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
