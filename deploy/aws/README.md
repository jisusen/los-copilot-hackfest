# Deploy to Amazon Web Services (AWS)

AWS has multiple ways to deploy. The easiest for hackathons: **EC2 free tier** or **Lightsail**.

---

## Option 1: EC2 Free Tier (Recommended)

t2.micro instance is free for 12 months. Run Docker Compose directly.

### 1. Launch EC2 Instance
1. Go to [AWS Console](https://console.aws.amazon.com/) → EC2 → Instances → Launch Instances
2. Settings:
   - **Name:** `bms-los-demo`
   - **AMI:** Ubuntu Server 22.04 LTS (free tier)
   - **Instance type:** `t2.micro` (free tier)
   - **Key pair:** Create new or use existing
   - **Network settings:** Create security group
     - ☑ Allow SSH from anywhere (or your IP)
     - ☑ Allow HTTP from internet
     - ☑ Allow HTTPS from internet
     - Add custom TCP rules:
       - Port 3333, source: 0.0.0.0/0
       - Port 3003, source: 0.0.0.0/0
   - **Storage:** 30 GB gp2 (free tier limit)
3. Click **Launch Instance**

### 2. SSH into Instance
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### 3. Install Docker & Docker Compose
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

### 4. Clone & Deploy
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
docker-compose up --build -d
```

### 5. Access URLs
- LOS Demo: `http://<EC2_PUBLIC_IP>:3333`
- Dashboard: `http://<EC2_PUBLIC_IP>:3003`

---

## Option 2: AWS Lightsail (Simpler Billing)

Lightsail is AWS's VPS service with predictable pricing. No surprise bills.

### 1. Create Lightsail Instance
1. Go to [Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **Create instance**
3. Settings:
   - **Platform:** Linux/Unix
   - **Blueprint:** OS Only → Ubuntu 22.04 LTS
   - **Instance plan:** $5/month (2 GB RAM, 1 vCPU) or $3.50/month
   - **Identify your instance:** `bms-los-demo`
4. Click **Create instance**

### 2. Open Firewall Ports
1. Go to instance → Networking tab
2. Under **IPv4 Firewall**, add rules:
   - Application: `Custom`, Protocol: `TCP`, Port: `3333`
   - Application: `Custom`, Protocol: `TCP`, Port: `3003`

### 3. SSH & Deploy
Use the browser-based SSH or download the key:
```bash
ssh ubuntu@<LIGHTSAIL_IP>

# Then same as EC2:
sudo apt-get update && sudo apt-get install -y docker.io docker-compose git
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
docker-compose up --build -d
```

---

## Option 3: ECS Fargate (Cloud Native)

For teams comfortable with AWS. Uses containers without managing servers.

### Prerequisites
- ECR repositories for both images
- ECS cluster
- EFS for SQLite persistence (optional, complex)

### Push Images
```bash
# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# Build & push LOS
docker build -t los-demo .
docker tag los-demo <account>.dkr.ecr.<region>.amazonaws.com/los-demo:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/los-demo:latest

# Build & push Dashboard
cd dashboard
docker build -t copilot-dashboard .
docker tag copilot-dashboard <account>.dkr.ecr.<region>.amazonaws.com/copilot-dashboard:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/copilot-dashboard:latest
```

Then create ECS services pointing to these images.

### ⚠️ ECS Limitations
- Fargate tasks are ephemeral — SQLite won't persist without EFS
- EFS setup adds complexity
- Recommend this only if you're already familiar with ECS

---

## AWS Free Tier Limits
- 750 hours/month of t2.micro/t3.micro (12 months)
- 30 GB EBS storage
- 5 GB S3 standard storage
- Perfect for running this demo 24/7 during hackathon week
