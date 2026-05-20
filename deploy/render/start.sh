#!/bin/sh
set -e

echo "🌱 Seeding database if empty..."
bun run server/db/seed.ts

echo "🏦 Starting LOS Demo on port $PORT..."
bun run server/index.ts &

echo "🤖 Starting Dashboard on port $DASHBOARD_PORT..."
cd /app/dashboard && bun run server/index.ts &

echo "✅ Both services running"
wait
