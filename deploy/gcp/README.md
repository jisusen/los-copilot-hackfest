# Deploy to Google Cloud Platform (GCP)

GCP offers a generous free tier perfect for hackathon demos. Two approaches: **VM (easiest)** or **Cloud Run (serverless)**.

---

## Option 1: Compute Engine VM (Recommended — Free Tier)

Just a Linux VM running Docker Compose. Zero code changes. Always free e2-micro instance available.

### 1. Create VM Instance
1. Go to [GCP Console](https://console.cloud.google.com/) → Compute Engine → VM Instances
2. Click **Create Instance**
3. Settings:
   - **Name:** `bms-los-demo`
   - **Region:** `us-central1` (or nearest to you)
   - **Machine type:** `e2-micro` (free tier eligible)
   - **Boot disk:** Ubuntu 22.04 LTS, 30 GB standard persistent disk
   - **Firewall:** ☑ Allow HTTP traffic, ☑ Allow HTTPS traffic
4. Click **Create**

### 2. Open Firewall Ports
```bash
# In GCP Console → VPC Network → Firewall
gcloud compute firewall-rules create los-demo-ports \
  --allow tcp:3333,tcp:3003 \
  --source-ranges 0.0.0.0/0 \
  --target-tags los-demo
```

Then edit your VM → Network tags → Add `los-demo`.

### 3. SSH into VM
```bash
gcloud compute ssh bms-los-demo
```

### 4. Install Docker & Docker Compose
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

### 5. Clone & Deploy
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
docker-compose up --build -d
```

### 6. Access URLs
- LOS Demo: `http://<VM_EXTERNAL_IP>:3333`
- Dashboard: `http://<VM_EXTERNAL_IP>:3003`

### 7. Persistent Disk
The VM's disk persists across reboots, so your SQLite DB survives. Just don't delete the VM.

---

## Option 2: Cloud Run (Serverless)

Cloud Run scales to zero but has **ephemeral storage**. SQLite won't persist between requests. Best for demo with mock data only.

### Build & Push Image
```bash
# Build LOS image
gcloud builds submit --tag gcr.io/PROJECT_ID/los-demo .

# Build Dashboard image
cd dashboard
gcloud builds submit --tag gcr.io/PROJECT_ID/copilot-dashboard .
```

### Deploy to Cloud Run
```bash
# Deploy LOS
gcloud run deploy los-demo \
  --image gcr.io/PROJECT_ID/los-demo \
  --port 3333 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy Dashboard
gcloud run deploy copilot-dashboard \
  --image gcr.io/PROJECT_ID/copilot-dashboard \
  --port 3003 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars LOS_URL=https://los-demo-xxx.run.app,MOCK_AGENT=true
```

### ⚠️ Cloud Run Limitations
- SQLite resets on every cold start (use mock mode only)
- No WebSocket support (Dashboard WS won't work)
- For production, migrate to Cloud SQL PostgreSQL

---

## GCP Free Tier Limits
- 1 e2-micro VM instance per month (US regions)
- 30 GB HDD persistent disk
- 1 GB outbound traffic per month
- Plenty for a hackathon demo!
