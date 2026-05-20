# Copilot Dashboard — Bun + React + WebSocket
FROM oven/bun:1-alpine
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source and build client
COPY . .
ENV NODE_ENV=production
ENV MOCK_AGENT=true
RUN bun run build

EXPOSE 3003

CMD ["bun", "run", "server/index.ts"]
