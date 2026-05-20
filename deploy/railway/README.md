# Deploy to Railway (Option A)

Railway supports Docker Compose out of the box. Best for full-stack deployment with persistent SQLite.

## Prerequisites
- [Railway account](https://railway.app/)
- Repo pushed to GitHub

## Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo

### 3. Deploy with Docker Compose
Railway auto-detects `docker-compose.yml`. It will create two services:
- `los-demo` (port 3333)
- `dashboard` (port 3003)

### 4. Add Persistent Volume
Railway volumes are ephemeral by default. For SQLite persistence:
1. Go to **los-demo** service → **Volumes**
2. Add volume, mount path: `/app/data`
3. Do the same for **dashboard** service with the **same volume name**

Or use **Railway's native volume sharing** (Docker Compose volumes work automatically on Railway).

### 5. Set Environment Variables
In Railway dashboard, add to both services:

**los-demo:**
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `*` (or your dashboard domain)

**dashboard:**
- `NODE_ENV` = `production`
- `MOCK_AGENT` = `true`
- `LOS_URL` = `https://<los-demo-domain>.up.railway.app`
- `DB_PATH` = `/app/data/los.db`
- `CORS_ORIGIN` = `*` (or your LOS domain)

### 6. Generate Domain
Click **Settings** → **Generate Domain** for both services.

### 7. Update CORS
After getting domains, update `CORS_ORIGIN` on both services to each other's domain for security.

## URLs After Deploy
- LOS Demo: `https://<los-demo>.up.railway.app`
- Dashboard: `https://<dashboard>.up.railway.app`

## Notes
- First deploy takes ~2 min (Bun install + build)
- SQLite DB persists across deploys thanks to shared volume
- Use `MOCK_AGENT=true` for demo — real Python agent needs Playwright/Chromium which is heavy for containers
