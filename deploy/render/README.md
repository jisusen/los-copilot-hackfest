# Deploy to Render (Option A)

Render is great for hobby projects with free tier. We use a **single combined container** since Render doesn't share disks between separate services.

## Prerequisites
- [Render account](https://render.com/)
- Repo pushed to GitHub

## Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "ready for render deploy"
git push origin main
```

### 2. Create Blueprint
Render supports [Blueprints](https://render.com/docs/blueprint-spec) (Infrastructure as Code).

1. Go to Render Dashboard → **Blueprints** → **New Blueprint Instance**
2. Connect your GitHub repo
3. Render reads `render.yaml` from repo root

### 3. Deploy
Render will:
- Build the combined Docker image
- Expose both ports (3333 + 3003)
- Create a disk for SQLite persistence

### 4. Access URLs
After deploy, you'll get:
- LOS Demo: `https://<service-name>.onrender.com` (port 3333)
- Dashboard: `https://<service-name>.onrender.com:3003` or via path routing

**Note:** Render free web services spin down after 15 min inactivity. First request wakes them up (~30s cold start).

## Alternative: Manual Docker Deploy
If Blueprint doesn't work:
1. Create **New Web Service**
2. Select Docker runtime
3. Point to repo root
4. Set:
   - **Dockerfile Path:** `deploy/render/Dockerfile`
   - **Build Context:** `.`
   - **Port:** `3333`
5. Add disk:
   - **Mount Path:** `/app/data`
   - **Size:** 1 GB

## Environment Variables
Set in Render dashboard:
- `NODE_ENV` = `production`
- `MOCK_AGENT` = `true`
- `CORS_ORIGIN` = `*`
