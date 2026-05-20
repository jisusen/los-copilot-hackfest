# Deployment Guide 🚀

Three options depending on which cloud provider sponsors your hackathon.

| Option | Provider | Full Stack? | Difficulty | Best For |
|--------|----------|-------------|------------|----------|
| **A** | Railway / Render / Fly.io | ✅ Yes | Easy | Full demo with working APIs + SQLite |
| **B** | Docker (any VPS) | ✅ Yes | Medium | Self-hosted or custom cloud |
| **C** | Vercel | ❌ Frontend only | Easy | If Vercel sponsors + backend on Railway |

## Quick Decision Tree

```
Which cloud provider sponsored?
├── Railway / Render / Fly.io
│   └── Option A → pick your favorite
│         ├── Railway → see railway/README.md
│         ├── Render  → see render/README.md
│         └── Fly.io  → see flyio/README.md
│
├── GCP (Google Cloud)
│   └── Option A → see gcp/README.md
│         ├── Compute Engine VM (free tier, recommended)
│         └── Cloud Run (serverless, SQLite limitation)
│
├── Cloudflare
│   └── Option A/C → see cloudflare/README.md
│         ├── Pages (static frontend, recommended)
│         ├── Tunnel (share localhost instantly)
│         └── Workers + D1 (full edge stack, advanced)
│
├── AWS
│   └── Option A → see aws/README.md
│         ├── EC2 Free Tier (recommended)
│         ├── Lightsail (simple billing)
│         └── ECS Fargate (cloud native)
│
├── Only Vercel sponsored?
│   └── Option C → see vercel/README.md
│       (backend must run on Railway/Render/GCP/AWS free tier)
│
└── No sponsor / bring your own server?
    └── Option B → docker-compose up
```

## Option A: Railway (Recommended)
```bash
git push origin main
# Then: Railway Dashboard → New Project → GitHub Repo → Deploy
```
- Auto-detects `docker-compose.yml`
- Shared volume for SQLite persistence
- Two separate services (clean architecture)

## Option B: Docker
```bash
docker-compose up --build
```
- Works anywhere Docker runs
- Local development + production
- Shared `los-data` volume for SQLite

## Option C: Vercel
```bash
# Build static sites
bun run build
cd dashboard && bun run build

# Deploy
vercel --prod dist/
cd dashboard && vercel --prod dist/
```
- Fast global CDN
- Requires separate backend host

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3333 / 3003 | Server port |
| `NODE_ENV` | development | `production` skips dev builds |
| `MOCK_AGENT` | false | Use mock agent instead of Python |
| `LOS_URL` | http://localhost:3333 | Dashboard → LOS connection |
| `DB_PATH` | ../../data/los.db | SQLite file path |
| `CORS_ORIGIN` | * | CORS allow origin |

## Need Help?
- Check individual READMEs in `railway/`, `render/`, `flyio/`, `vercel/`
- Both servers now auto-enable CORS for cross-domain deployments
