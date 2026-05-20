# Deploy to Fly.io (Option A)

Fly.io runs apps close to users globally. Great for low-latency demos.

## Prerequisites
- [Fly.io account](https://fly.io/)
- [flyctl](https://fly.io/docs/flyctl/install/) installed
- Repo pushed to GitHub

## Steps

### 1. Install flyctl & Login
```bash
fly auth login
```

### 2. Launch App
```bash
fly launch --dockerfile Dockerfile --name bms-los-demo
```

This creates `fly.toml`.

### 3. Add Volume for SQLite
```bash
fly volumes create los_data --size 1 --region <your-region>
```

Update `fly.toml` to mount the volume (see sample below).

### 4. Deploy
```bash
fly deploy
```

## Sample fly.toml

```toml
app = 'bms-los-demo'
primary_region = 'sin'

[build]
  dockerfile = 'Dockerfile'

[[mounts]]
  source = 'los_data'
  destination = '/app/data'

[http_service]
  internal_port = 3333
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[services]]
  internal_port = 3003
  protocol = 'tcp'
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  [[services.ports]]
    handlers = ['http']
    port = 3003
```

## Notes
- Fly.io free tier: 3 shared-cpu-1x VMs, 3GB persistent volumes
- For dashboard + LOS together, use the combined Render Dockerfile or deploy as separate Fly apps
- SQLite works great with Fly volumes
