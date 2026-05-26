# White-Label SaaS Platform - Complete Documentation

## Project Overview

This is a **production-ready multi-tenant SaaS platform** built with:
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript + JSON storage
- **Server:** Caddy reverse proxy with automatic HTTPS
- **Process Manager:** pm2 for production deployment

### Key Features

✅ **Multi-tenant architecture** - Multiple clients with separate subdomains  
✅ **Custom domain support** - Clients can connect their own domains  
✅ **Automatic HTTPS** - Caddy handles SSL/TLS automatically  
✅ **Domain verification** - Automatic CNAME verification system  
✅ **Simple authentication** - JWT-based dummy authentication  
✅ **Zero-database** - Uses JSON files for data storage  
✅ **Scalable** - pm2 clustering for multiple instances  

---

## Architecture

### Multi-Tenant Routing Flow

```
User visits: demo.dhanyatraders.live
                    ↓
            Caddy reverse proxy
                    ↓
         Next.js middleware reads hostname
                    ↓
        Backend API resolves tenant from domain
                    ↓
          Loads tenant-specific data & styling
                    ↓
         Displays branded tenant dashboard
```

### Domain Examples

| Domain | Type | Resolves To | Tenant |
|--------|------|-------------|--------|
| plantgen.live | Main site | Frontend | None |
| client1.plantgen.live | Subdomain | Frontend | Client 1 |
| demo.dhanyatraders.live | Custom | Frontend | Client 1 |
| api.plantgen.live | API | Backend | None |

---

## Project Structure

```
Creating-caddy-for-saas-app/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── auth.module.ts
│   │   ├── tenant/             # Tenant module
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.controller.ts
│   │   │   ├── tenant.dto.ts
│   │   │   └── tenant.module.ts
│   │   ├── domain/             # Domain management module
│   │   │   ├── domain.service.ts
│   │   │   ├── domain.controller.ts
│   │   │   ├── domain.dto.ts
│   │   │   └── domain.module.ts
│   │   ├── common/             # Shared services
│   │   │   ├── storage.service.ts
│   │   │   └── jwt.service.ts
│   │   ├── main.ts             # Application entry
│   │   ├── app.module.ts       # Root module
│   │   └── app.controller.ts
│   ├── data/
│   │   ├── tenants.json        # Tenant data
│   │   ├── users.json          # User credentials
│   │   └── domains.json        # Domain mappings
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   ├── login/page.tsx      # Login page
│   │   ├── dashboard/page.tsx  # Tenant dashboard
│   │   ├── domain-settings/page.tsx
│   │   ├── admin/page.tsx      # Admin panel
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── components/
│   │       ├── Navigation.tsx
│   │       ├── UI.tsx
│   │       └── ProtectedLayout.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── store.ts            # Zustand state
│   ├── middleware.ts           # Tenant detection
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
├── caddy/
│   ├── Caddyfile               # Caddy configuration
│   ├── run-caddy.sh            # Caddy startup script
│   └── setup.sh                # Installation script
├── docs/                       # Documentation
└── ecosystem.config.js         # pm2 configuration
```

---

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### 1. Clone and Setup

```bash
# Navigate to project directory
cd Creating-caddy-for-saas-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Test the Application

**Login Credentials:**
- **Admin:** username: `admin`, password: `admin123`
- **Client 1:** username: `client1admin`, password: `password123`
- **Client 2:** username: `client2admin`, password: `password123`

**Access URLs:**
- Main site: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- Admin: http://localhost:3000/admin
- Domain settings: http://localhost:3000/domain-settings

---

## Backend API Documentation

### Authentication

#### POST /api/auth/login
Login and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@plantgen.live",
    "tenantId": null,
    "role": "superadmin"
  }
}
```

#### POST /api/auth/verify
Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "payload": { /* decoded token */ }
}
```

### Tenants

#### GET /api/tenant
Get all tenants.

**Response:**
```json
[
  {
    "id": 1,
    "company": "Dhanya Traders",
    "subdomain": "client1",
    "customDomain": "demo.dhanyatraders.live",
    "themeColor": "#16a34a",
    "logo": "https://...",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/tenant/:id
Get tenant by ID.

#### POST /api/tenant/resolve
Resolve tenant from hostname.

**Request:**
```json
{
  "hostname": "client1.plantgen.live"
}
```

**Response:**
```json
{
  "id": 1,
  "company": "Dhanya Traders",
  "subdomain": "client1",
  /* ... tenant data ... */
}
```

#### POST /api/tenant
Create new tenant (admin only).

**Request:**
```json
{
  "company": "New Company",
  "subdomain": "newco",
  "email": "admin@newco.com",
  "themeColor": "#FF0000",
  "logo": "https://..."
}
```

### Domains

#### POST /api/domain/connect
Connect custom domain to tenant.

**Request:**
```json
{
  "tenantId": 1,
  "domain": "demo.dhanyatraders.live"
}
```

**Response:**
```json
{
  "domain": "demo.dhanyatraders.live",
  "verification": {
    "method": "CNAME",
    "target": "client1.plantgen.live",
    "instructions": [
      "Add CNAME record for demo.dhanyatraders.live",
      "Point to: client1.plantgen.live",
      /* ... */
    ]
  }
}
```

#### POST /api/domain/verify
Verify custom domain DNS records.

**Request:**
```json
{
  "tenantId": 1,
  "domain": "demo.dhanyatraders.live"
}
```

#### GET /api/domain/tenant/:tenantId
Get all domains for tenant.

---

## Frontend Pages

### 1. Home Page (`/`)
- Landing page with feature overview
- Display main site or tenant dashboard based on hostname

### 2. Login Page (`/login`)
- Username/password form
- Demo credentials display
- JWT token stored in localStorage

### 3. Dashboard (`/dashboard`)
- Shows tenant company info
- Displays theme color and logo
- Quick stats and settings

### 4. Domain Settings (`/domain-settings`)
- Add custom domain form
- DNS verification instructions
- List of connected domains with status

### 5. Admin Panel (`/admin`)
- Create new tenants
- View all tenants
- Manage tenant details
- Super admin only

---

## Caddy Server Configuration

### Caddyfile Overview

The Caddyfile handles:
- **Wildcard subdomains** → Reverse proxy to frontend
- **API routing** → Reverse proxy to backend
- **HTTPS** → Automatic Let's Encrypt
- **CORS headers** → Properly configured

### DNS Configuration (Production)

For production, add these DNS records:

```dns
; Main domain
plantgen.live.          3600 A    YOUR_SERVER_IP
www.plantgen.live.      3600 CNAME plantgen.live.

; Wildcard for subdomains
*.plantgen.live.        3600 A    YOUR_SERVER_IP

; API endpoint
api.plantgen.live.      3600 A    YOUR_SERVER_IP

; Customer custom domain (example)
demo.dhanyatraders.live. 3600 CNAME client1.plantgen.live.
```

---

## Deployment (Production)

### Ubuntu 22.04 Setup

#### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install nodejs -y

# Install Caddy
sudo apt install caddy -y

# Install pm2 globally
sudo npm install -g pm2

# Create project directory
sudo mkdir -p /opt/plantgen-saas
cd /opt/plantgen-saas
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo> .

# Install dependencies
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit .env files with production values
nano backend/.env
nano frontend/.env.local
```

#### 3. Configure Caddy

```bash
# Copy Caddyfile
sudo cp caddy/Caddyfile /etc/caddy/Caddyfile

# Update domain in Caddyfile
sudo nano /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

#### 4. Start Services with pm2

```bash
# Make scripts executable
chmod +x caddy/run-caddy.sh

# Start pm2 services
pm2 start ecosystem.config.js

# Verify status
pm2 status

# Save startup configuration
pm2 startup
pm2 save
```

#### 5. Setup Monitoring

```bash
# View logs
pm2 logs

# Monitor in real-time
pm2 monit

# Setup log rotation
pm2 install pm2-logrotate
```

#### 6. SSL/HTTPS

```bash
# Caddy auto-handles HTTPS with Let's Encrypt
# Verify SSL
curl -I https://plantgen.live

# Check certificate renewal
caddy status
```

### Production Checklist

- [ ] Update `JWT_SECRET` in backend `.env`
- [ ] Configure DNS records pointing to server IP
- [ ] Update `NEXT_PUBLIC_API_URL` to production domain
- [ ] Enable Caddy HTTPS auto-renewal
- [ ] Setup automated backups for JSON data files
- [ ] Configure firewall (allow 80, 443, 22)
- [ ] Enable log rotation
- [ ] Setup monitoring/alerting
- [ ] Test custom domain flow

---

## Custom Domain Verification Flow

### How It Works

**Step 1: User adds custom domain**
```
User goes to Domain Settings
Enters: demo.dhanyatraders.live
System generates verification CNAME
```

**Step 2: DNS Configuration**
```
User adds CNAME record to their DNS:
demo.dhanyatraders.live CNAME → client1.plantgen.live
```

**Step 3: Verification**
```
User clicks "Verify Domain"
Backend checks DNS CNAME record
If valid, marks domain as verified
```

**Step 4: Custom Domain Active**
```
demo.dhanyatraders.live now routes to:
Same tenant as client1.plantgen.live
```

### Example Configuration

**Client's DNS Provider (GoDaddy, Cloudflare, etc.):**

| Type | Name | Value |
|------|------|-------|
| CNAME | demo.dhanyatraders.live | client1.plantgen.live |

After DNS propagation (5-10 mins), both domains work:
- `client1.plantgen.live` → Shows Dhanya Traders
- `demo.dhanyatraders.live` → Shows Dhanya Traders

---

## Data Storage (JSON)

### tenants.json
Stores all tenant information:
- Company name
- Subdomain
- Custom domain
- Theme color
- Logo URL
- Status

### users.json
Stores user credentials:
- Username/password (demo only)
- Email
- Tenant ID association
- Role (superadmin/admin)

### domains.json
Stores custom domain mappings:
- Tenant ID
- Domain name
- Verification status
- Verification token
- Verification method (CNAME/TXT)

---

## Scaling & Performance

### Horizontal Scaling with pm2

```javascript
// ecosystem.config.js already configured for:
instances: 2,  // Run 2 backend instances
exec_mode: 'cluster',  // Use clustering
max_memory_restart: '500M'  // Auto-restart on memory limit
```

### Caching Strategy

- Static assets cached by Caddy
- Frontend builds with Next.js static generation
- Backend responses include cache headers

### Database Migration (Future)

When ready to scale to PostgreSQL:

1. Install Prisma: `npm install @prisma/client`
2. Define schema in `prisma/schema.prisma`
3. Replace FileStorageService with database queries
4. No changes needed to controllers/DTOs

---

## Troubleshooting

### Backend not responding

```bash
# Check if backend is running
curl http://localhost:8000/health

# View backend logs
pm2 logs saas-backend

# Restart backend
pm2 restart saas-backend
```

### Frontend not loading

```bash
# Check frontend running
curl http://localhost:3000

# View frontend logs
pm2 logs saas-frontend

# Verify Caddy routing
sudo caddy validate --config /etc/caddy/Caddyfile
```

### DNS/Domain issues

```bash
# Check DNS resolution
nslookup client1.plantgen.live

# Verify CNAME
dig demo.dhanyatraders.live

# Test SSL certificate
openssl s_client -connect demo.dhanyatraders.live:443
```

### JWT Token issues

```bash
# Token decode (add to console for debugging)
const decoded = jwt.decode(token);
console.log(decoded);

# Check token expiration
echo $(($(date +%s) - decoded.exp))
```

---

## Security Considerations

⚠️ **This is a learning/demo project. For production:**

1. **Authentication:**
   - Replace dummy login with real authentication
   - Implement refresh tokens
   - Add rate limiting
   - Use httpOnly cookies for tokens

2. **Data Storage:**
   - Migrate to proper database (PostgreSQL)
   - Encrypt sensitive data at rest
   - Use environment variables for secrets

3. **CORS:**
   - Restrict to specific domains only
   - Remove `credentials: true` if not needed

4. **API Security:**
   - Add request validation
   - Implement API key authentication
   - Add request signing

5. **Infrastructure:**
   - Enable firewall
   - Use private networks for databases
   - Enable automated backups
   - Use SSL/TLS everywhere

---

## Environment Variables

### Backend (.env)
```
PORT=8000
NODE_ENV=production
JWT_SECRET=your-super-secure-key-here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.plantgen.live
```

---

## Additional Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **Caddy Docs:** https://caddyserver.com/docs
- **pm2 Docs:** https://pm2.keymetrics.io
- **JWT.io:** https://jwt.io

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend/frontend logs
3. Verify DNS configuration
4. Check firewall rules

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Production Ready
