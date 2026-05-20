# Deploy to Vercel (Option C — Frontend Only)

Vercel is perfect for static frontends but **cannot run Bun servers or SQLite**. Use this only if Vercel sponsors your hackathon and you run the backend elsewhere (Railway/Render free tier).

## What Gets Deployed
- **Static React frontend** (no backend APIs)
- Backend must run on a separate service

## Prerequisites
- [Vercel account](https://vercel.com/)
- Backend API running somewhere (Railway/Render free tier)
- [Vercel CLI](https://vercel.com/docs/cli) optional

## Steps

### 1. Build Static Sites Locally
```bash
# Build LOS frontend
cd <root>
bun run build

# Build Dashboard frontend
cd dashboard
bun run build
```

### 2. Update API URLs
Edit `client/lib/api.ts` and `dashboard/client/lib/api.ts` to use your backend URL:
```typescript
const API_BASE = 'https://your-backend.onrender.com'; // or Railway URL
```

Then rebuild.

### 3. Deploy LOS Frontend to Vercel
```bash
cd <root>
vercel --prod dist/
```

Or drag `dist/` folder to [Vercel Dashboard](https://vercel.com/dashboard).

### 4. Deploy Dashboard Frontend to Vercel
```bash
cd dashboard
vercel --prod dist/
```

### 5. Configure SPA Routing
Both `vercel.json` files are already set up for React Router.

## Architecture
```
Vercel (Static)          External Backend (Railway/Render)
├─ LOS Frontend          ├─ LOS API (port 3333)
└─ Dashboard Frontend    └─ Dashboard API (port 3003)
                         └─ SQLite DB (persistent disk)
```

## Limitations
- ❌ No server-side rendering
- ❌ No WebSocket (dashboard uses polling fallback)
- ❌ No Python agent (use `MOCK_AGENT=true` on backend)
- ✅ Fast global CDN for frontend
- ✅ Free forever for static sites

## Recommended Hybrid
If you have both Vercel + Railway sponsorship:
- **Vercel:** Frontend hosting (blazing fast)
- **Railway:** Backend APIs + SQLite (persistent volume)
