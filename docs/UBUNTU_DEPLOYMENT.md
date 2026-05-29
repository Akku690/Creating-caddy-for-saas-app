# Deployment to Ubuntu 22.04 Server

Complete step-by-step guide for production deployment.

## Prerequisites

- Ubuntu 22.04 server (VPS/EC2/DigitalOcean)
- Domain name with DNS access
- SSH access to server

## Step 1: Server Preparation

### 1.1 Connect to Server

```bash
ssh root@your_server_ip
```

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Required Packages

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
apt install nodejs -y

# Caddy web server
apt install caddy -y

# Git
apt install git -y

# Certbot for SSL (if not using Caddy's auto-SSL)
apt install certbot -y

# UFW firewall
apt install ufw -y

# Nginx (optional, for log viewing)
apt install nginx -y
```

### 1.4 Install pm2 Globally

```bash
npm install -g pm2
```

### 1.5 Setup Firewall

```bash
# Enable firewall
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Verify
ufw status
```

## Step 2: Clone and Setup Application

### 2.1 Create Application Directory

```bash
mkdir -p /opt/plantgen-saas
cd /opt/plantgen-saas
```

### 2.2 Clone Repository

```bash
# If using git
git clone https://github.com/yourusername/plantgen-saas.git .

# Or copy files via SCP
# scp -r ~/Downloads/saas/Creating-caddy-for-saas-app/* root@server:/opt/plantgen-saas/
```

### 2.3 Install Dependencies

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# Return to root
cd ..
```

Use these commands from the application root so both builds run against the correct package manifests and output directories.

## Step 3: Environment Configuration

### 3.1 Backend Environment

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Update with production values:
```env
PORT=8000
NODE_ENV=production
```

This deployment is public/no-auth, so no JWT secret is required for the main app flow.

### 3.2 Frontend Environment

```bash
cp frontend/.env.local.example frontend/.env.local
nano frontend/.env.local
```

Update:
```env
NEXT_PUBLIC_API_URL=https://api.plantgen.live
```

For local development, you can keep `NEXT_PUBLIC_API_URL=http://localhost:8000`, but production builds should use the API subdomain.

## Step 4: Configure Caddy

### 4.1 Update Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the entire content with (update domain names):

```caddy
# Main domain
plantgen.live, www.plantgen.live {
  reverse_proxy localhost:3000
  encode gzip
}

# Wildcard subdomains
*.plantgen.live {
  reverse_proxy localhost:3000
  encode gzip
}

# API domain
api.plantgen.live {
  reverse_proxy localhost:8000
  encode gzip
}

# Health check
health.plantgen.live {
  respond "OK" 200
}
```

### 4.2 Test Caddy Configuration

```bash
caddy validate --config /etc/caddy/Caddyfile
```

### 4.3 Reload Caddy

```bash
systemctl reload caddy
```

## Step 5: Start Services with pm2

### 5.1 Start pm2

```bash
pm2 start ecosystem.config.js
```

If you changed `ecosystem.config.js`, restart the processes instead of reusing an old PM2 definition:

```bash
pm2 delete all
pm2 start ecosystem.config.js
```

### 5.2 Check Status

```bash
pm2 status
pm2 logs
```

Important: this deployment uses JSON files for storage, so the backend must run as a single PM2 process. Do not switch `saas-backend` to cluster mode until you migrate to a real database.

### 5.3 Setup pm2 Startup

```bash
pm2 startup
pm2 save
```

Note: Caddy is run as a system service (`systemctl status caddy`), not as a PM2 app. If you update the `Caddyfile`, reload it with `systemctl reload caddy`.

## Step 6: Configure DNS

In your domain registrar (GoDaddy, Namecheap, etc.):

### 6.1 Main Domain

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ (or plantgen.live) | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |

### 6.2 Wildcard Subdomains

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | * | YOUR_SERVER_IP | 3600 |

### 6.3 API Subdomain

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | YOUR_SERVER_IP | 3600 |

**Wait 5-10 minutes for DNS propagation**

### 6.4 Verify DNS

```bash
nslookup plantgen.live
nslookup client1.plantgen.live
nslookup api.plantgen.live
```

## Step 7: SSL/HTTPS Certificate

Caddy handles this automatically! Once DNS is configured:

```bash
# Test SSL
curl -I https://plantgen.live

# Check certificate
curl -v https://plantgen.live 2>&1 | grep "subject="
```

## Step 8: Verify Deployment

### 8.1 Check Frontend

```bash
curl https://plantgen.live
# Should return HTML
```

### 8.2 Check Backend

```bash
curl https://api.plantgen.live/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 8.3 Check Subdomain

```bash
curl https://client1.plantgen.live
# Should return tenant-specific HTML
```

## Step 9: Monitoring & Maintenance

### 9.1 View Logs

```bash
# All services
pm2 logs

# Specific service
pm2 logs saas-backend

# Real-time monitoring
pm2 monit
```

### 9.2 Auto-restart on Reboot

```bash
pm2 save
pm2 startup
```

### 9.3 Install Log Rotation

```bash
pm2 install pm2-logrotate
```

### 9.4 Regular Backups

```bash
# Backup data directory
tar -czf /backups/plantgen-data-$(date +%Y%m%d).tar.gz \
  /opt/plantgen-saas/backend/data/

# Backup configuration
tar -czf /backups/plantgen-config-$(date +%Y%m%d).tar.gz \
  /opt/plantgen-saas/backend/.env \
  /opt/plantgen-saas/frontend/.env.local \
  /etc/caddy/Caddyfile
```

### 9.5 Setup Cron Job for Backups

```bash
crontab -e

# Add line:
0 2 * * * /opt/plantgen-saas/scripts/backup.sh
```

## Troubleshooting

### Services Not Starting

```bash
pm2 restart all
pm2 logs
```

### DNS Not Resolving

```bash
# Flush DNS cache
systemd-resolve --flush-caches

# Check DNS propagation
dig plantgen.live @8.8.8.8
```

### SSL Certificate Issues

```bash
# Caddy status
systemctl status caddy

# Restart Caddy
systemctl restart caddy

# Check certificate
ls -la /var/lib/caddy/certificates/
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :8000
lsof -i :80

# Kill process
kill -9 <PID>
```

### High Memory Usage

```bash
# Check memory
free -h
ps aux --sort=-%mem | head

# Increase Node.js memory limit in ecosystem.config.js
max_memory_restart: '1000M'

# Restart
pm2 restart all
```

## Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate working (green padlock)
- [ ] Backend API responding
- [ ] Frontend loading correctly
- [ ] Subdomain routing working
- [ ] pm2 autorestart configured
- [ ] Backups setup
- [ ] Monitoring configured
- [ ] Firewall enabled
- [ ] SSH key authentication enabled (no password)
- [ ] Fail2ban installed for DDoS protection
- [ ] Regular database backups enabled

## Advanced: Setup Fail2ban (Optional)

```bash
apt install fail2ban -y

# Create jail configuration
nano /etc/fail2ban/jail.local
```

Add:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[caddy-http]
enabled = true
filter = caddy
port = 80,443
logpath = /var/log/caddy/access.log
maxretry = 10
```

Start fail2ban:
```bash
systemctl start fail2ban
systemctl enable fail2ban
```

## Advanced: Scaling with Multiple Instances

### Load Balancing Setup

For high traffic, setup multiple app servers:

```bash
# ecosystem.config.js
instances: 4,  // Run 4 backend instances
exec_mode: 'cluster',  // Use clustering

# Or add Nginx load balancer before Caddy
# upstream backend {
#   server localhost:8000;
#   server localhost:8001;
#   server localhost:8002;
# }
```

## Advanced: Database Migration

When ready to scale beyond JSON files:

```bash
# Install Prisma
npm install @prisma/client @prisma/migration

# Setup PostgreSQL
apt install postgresql postgresql-contrib -y

# Initialize Prisma
npx prisma init

# Create schema and migrate
npx prisma migrate dev --name init
```

Then update FileStorageService to use Prisma client.

---

## Support & Resources

- **Caddy:** https://caddyserver.com/docs
- **pm2:** https://pm2.keymetrics.io
- **Node.js:** https://nodejs.org
- **Ubuntu Server:** https://ubuntu.com/server

---

**Your SaaS platform is now live!** 🚀

Monitor performance and make adjustments as needed for your use case.
