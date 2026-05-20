# LOS Demo — Bun + React + SQLite
FROM oven/bun:1-alpine
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source and build client
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Ensure data directory exists for SQLite volume mount
RUN mkdir -p data

EXPOSE 3333

# Seed DB if empty, then start server
CMD ["sh", "-c", "bun run server/db/seed.ts && bun run server/index.ts"]
