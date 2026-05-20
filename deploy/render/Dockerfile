# Combined LOS + Dashboard for Render
FROM oven/bun:1-alpine
WORKDIR /app

# === LOS Demo ===
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

# === Dashboard ===
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/bun.lock ./
RUN bun install
COPY dashboard/. .
RUN bun run build

# === Runtime ===
WORKDIR /app
RUN mkdir -p data

ENV NODE_ENV=production
ENV MOCK_AGENT=true
ENV PORT=3333
ENV DASHBOARD_PORT=3003
ENV DB_PATH=/app/data/los.db
ENV LOS_URL=http://localhost:3333
ENV CORS_ORIGIN=*

COPY deploy/render/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3333 3003
CMD ["./start.sh"]
