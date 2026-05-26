# Quick Start Guide

Get the SaaS platform running in 5 minutes!

## Development Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Back to root
cd ..
```

### 2. Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Output: `✓ Backend running on http://localhost:8000`

### 3. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Output: `ready - started server on 0.0.0.0:3000`

### 4. Open Browser

Visit: **http://localhost:3000**

### 5. Login with Demo Account

```
Username: admin
Password: admin123
```

## Test Multi-Tenant Features

### Test Subdomain Routing

Edit your `/etc/hosts` file (on macOS/Linux):
```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 plantgen.live
127.0.0.1 client1.plantgen.live
127.0.0.1 client2.plantgen.live
```

Then visit:
- http://plantgen.live:3000 → Main site
- http://client1.plantgen.live:3000 → Client 1 dashboard
- http://client2.plantgen.live:3000 → Client 2 dashboard

### Test Admin Features

Login with:
```
Username: admin
Password: admin123
```

Visit: http://localhost:3000/admin
- Create new tenants
- View all clients
- Manage domains

### Test Tenant Features

Login with:
```
Username: client1admin
Password: password123
```

Visit: http://localhost:3000/dashboard
- View tenant details
- Go to http://localhost:3000/domain-settings
- Add custom domain (e.g., example.com)
- Verify domain

## Production Deployment

### 1. Build for Production

```bash
# Backend build
cd backend
npm run build

# Frontend build
cd ../frontend
npm run build
cd ..
```

### 2. Install Caddy (Ubuntu)

```bash
sudo apt install caddy -y
```

### 3. Configure Caddy

```bash
sudo cp caddy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile  # Edit domain names
sudo systemctl reload caddy
```

### 4. Start with pm2

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get All Tenants
```bash
curl http://localhost:8000/api/tenant
```

### Resolve Tenant by Hostname
```bash
curl -X POST http://localhost:8000/api/tenant/resolve \
  -H "Content-Type: application/json" \
  -d '{"hostname":"client1.plantgen.live"}'
```

## File Structure Reference

```
backend/          → NestJS API server
frontend/         → Next.js web app
caddy/            → Reverse proxy config
docs/             → Documentation
ecosystem.config.js → pm2 config
```

## Next Steps

1. ✅ Get it running (done!)
2. 📖 Read [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) for deep dive
3. 🚀 Deploy to production
4. 🔧 Customize for your business
5. 💾 Migrate to real database (PostgreSQL)

## Troubleshooting

**Backend won't start?**
```bash
cd backend
npm install
npm run build
npm run dev
```

**Frontend not connecting to backend?**
```bash
# Check NEXT_PUBLIC_API_URL in frontend/.env.local
cat frontend/.env.local
```

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**DNS/subdomain not resolving?**
```bash
# Make sure /etc/hosts has entries
cat /etc/hosts

# Or for production, check DNS records
nslookup client1.plantgen.live
```

---

**That's it! You're ready to develop.** 🎉
