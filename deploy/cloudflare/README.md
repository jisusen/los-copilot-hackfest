# Deploy to Cloudflare

Cloudflare is great for hackathons because it's **fast globally** (300+ datacenters) and has a generous free tier. Two practical approaches for this project:

---

## Option 1: Cloudflare Pages (Static Frontend)

Like Vercel, but with Cloudflare's global edge network. Best for hosting the React frontends.

### Prerequisites
- [Cloudflare account](https://dash.cloudflare.com/)
- Backend API running elsewhere (Railway/Render/Ryzen free tier)

### Steps

#### 1. Build Static Sites

```bash
# Build LOS frontend
cd <root>
bun run build

# Build Dashboard frontend
cd dashboard
bun run build
```

#### 2. Install Wrangler CLI

```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

Login:
```bash
wrangler login
```

#### 3. Deploy LOS Frontend

```bash
cd <root>
wrangler pages deploy dist --project-name=bms-los-demo
```

#### 4. Deploy Dashboard Frontend

```bash
cd dashboard
wrangler pages deploy dist --project-name=bms-copilot-dashboard
```

#### 5. Update API URLs

Since Pages is static, you need to point API calls to your backend:

Edit `client/lib/api.ts` and `dashboard/client/lib/api.ts`:
```typescript
const API_BASE = 'https://your-backend.onrender.com';
```

Then rebuild and redeploy.

### URLs After Deploy
- LOS Demo: `https://bms-los-demo.pages.dev`
- Dashboard: `https://bms-copilot-dashboard.pages.dev`

### Cloudflare Pages Limits (Free)
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- Perfect for hackathon demos!

---

## Option 2: Cloudflare Tunnel (Share Local Dev)

**Best for hackathon judging!** No deployment needed — share your localhost via a public URL instantly.

### Install cloudflared

```bash
# macOS
brew install cloudflared

# Windows (via scoop)
scoop install cloudflared

# Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### Start Both Servers Locally

```bash
# Terminal 1 — LOS Demo
cd <root>
bun run dev

# Terminal 2 — Dashboard
cd dashboard
bun run dev
```

### Create Tunnels

```bash
# Tunnel for LOS (port 3333)
cloudflared tunnel --url http://localhost:3333

# Tunnel for Dashboard (port 3003) — in another terminal
cloudflared tunnel --url http://localhost:3003
```

You'll get public URLs like:
```
https://something.trycloudflare.com
```

### Share with Judges

Just paste the URLs! The judges can:
- Open LOS Demo at `https://abc.trycloudflare.com`
- Open Dashboard at `https://xyz.trycloudflare.com`

**Pros:**
- ✅ Zero deployment time
- ✅ Always latest code (you're coding live)
- ✅ Free, no account limits
- ✅ HTTPS out of the box

**Cons:**
- ❌ URL changes every time you restart the tunnel
- ❌ Tunnel closes when you stop the command
- ❌ Not suitable for permanent hosting

### Pro Tip: Named Tunnels

For a persistent URL during the hackathon:

```bash
# Login once
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create hackathon-demo

# Route it (get the tunnel ID from previous command)
cloudflared tunnel route dns hackathon-demo los-demo.yourdomain.com

# Run the tunnel
cloudflared tunnel run hackathon-demo --url http://localhost:3333
```

---

## Option 3: Cloudflare Workers + D1 (Advanced)

For teams comfortable with Cloudflare's ecosystem. Requires **significant code changes**:

| Current | Cloudflare Equivalent |
|---|---|
| Bun server | Cloudflare Workers (JS runtime) |
| SQLite (`bun:sqlite`) | D1 (edge SQLite database) |
| Python agent | Worker + fetch API (no Python) |
| WebSocket | Durable Objects + WebSocket |

### Migration Overview

1. **Replace `bun:sqlite`** with Cloudflare D1 bindings
2. **Rewrite server routes** as Worker handlers
3. **Replace Python agent** with a Worker-based mock agent
4. **Deploy everything** as one Worker with D1 database

### When to Use This
- You have **extra time** before the hackathon deadline
- Your team is already familiar with Workers
- You want to show off edge-native architecture to judges

### D1 Schema Setup

```sql
-- Run in Cloudflare D1 console
CREATE TABLE loan_applications (...);
CREATE TABLE debtors (...);
-- etc.
```

Then seed via Wrangler:
```bash
wrangler d1 execute your-db --file=./server/db/schema.sql
```

---

## Quick Comparison

| Approach | Setup Time | Persistence | Best For |
|---|---|---|---|
| **Pages** | 5 min | ✅ Permanent URL | Static frontend hosting |
| **Tunnel** | 2 min | ❌ Temporary URL | Live demo to judges |
| **Workers+D1** | 2+ hours | ✅ Permanent + edge | Full stack rewrite |

---

## Recommended Hackathon Flow

```
During development:
├── Local dev: localhost:3333 + localhost:3003
└── Quick share: cloudflared tunnel (for teammates)

During judging:
├── Frontend: Cloudflare Pages (fast global CDN)
├── Backend: Railway/Render (API + SQLite)
└── Backup: cloudflared tunnel (if deployed backend fails)
```

---

## Environment Variables for Cloudflare

If using Pages with a backend, set these in Cloudflare Dashboard:

```
VITE_API_BASE_URL=https://your-backend.railway.app
```

Or for Workers:
```
D1_DATABASE_ID=your-d1-db-id
ANTHROPIC_API_KEY=sk-ant-...
```

---

*Cloudflare free tier is unlimited bandwidth + unlimited requests. Perfect for hackathon demos that might go viral on HN/Twitter.*
