# Multi-Tenant & Custom Domains Setup Guide

## 📚 Overview

This SaaS platform supports two methods for serving multiple clients:

1. **Subdomains**: `client1.plantgen.live`, `client2.plantgen.live` (automatic via DNS)
2. **Custom Domains**: `demo.dhanyatraders.live` (verified via CNAME records)

---

## 🧪 Testing Multi-Tenant Locally

### Method 1: Using /etc/hosts (Recommended for Local Testing)

#### Step 1: Edit /etc/hosts
```bash
# On Linux/Mac
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 localhost
127.0.0.1 plantgen.live
127.0.0.1 client1.plantgen.live
127.0.0.1 client2.plantgen.live
127.0.0.1 lalaland.plantgen.live
```

#### Step 2: Test in Browser
- **Main Site**: http://plantgen.live:3000
- **Client 1**: http://client1.plantgen.live:3000 (Dhanya Traders)
- **Client 2**: http://client2.plantgen.live:3000 (Tech Startup)
- **New Client**: http://lalaland.plantgen.live:3000 (lala land)

### Method 2: Using Debug Panel (No Setup Required)
1. Go to: http://localhost:3000/debug
2. Enter hostname in the "Tenant Resolution" section
3. Click "Resolve Tenant" to test hostname lookup

---

## 🌐 Real Domain Setup (Production)

### Prerequisites
- Domain registrar access (GoDaddy, Namecheap, etc.)
- Caddy server running with HTTPS

### Step 1: Configure Primary Domain
```bash
# Update Caddyfile to use your domain
vim caddy/Caddyfile

# Change:
# plantgen.live → yourdomain.com
# *.plantgen.live → *.yourdomain.com
```

### Step 2: Update DNS Records

#### For Subdomains (Wildcard)
Go to your domain registrar and add:
```
Type: A Record
Name: *
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600
```

#### For Main Site
```
Type: A Record
Name: @
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600
```

**Verification**:
```bash
nslookup client1.yourdomain.com
nslookup www.yourdomain.com
```

---

## 🔗 Custom Domains Setup

### Example: Adding a Custom Domain

#### Step 1: User Adds Domain
1. Log in to tenant dashboard: http://client1.plantgen.live:3000
2. Go to **Domain Settings**
3. Enter custom domain: `demo.dhanyatraders.live`
4. Click **Connect**

#### Step 2: System Generates CNAME Instructions
System returns:
```
Add a CNAME record for: demo.dhanyatraders.live
Point to: client1.plantgen.live
Wait 5-10 minutes for DNS propagation
Then click Verify Domain button
```

#### Step 3: User Updates DNS Records
User logs into their domain registrar (GoDaddy, Route53, etc.) and adds:

**Option A: CNAME Record** (Recommended for subdomains)
```
Type: CNAME
Name: demo
Value: client1.plantgen.live
TTL: 3600
```

**Option B: A Record + Alias** (For root domains)
```
Type: A
Name: demo.dhanyatraders.live
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600
```

#### Step 4: Verify in Browser
```bash
# Wait 5-10 minutes for DNS propagation
nslookup demo.dhanyatraders.live

# Then test in browser
http://demo.dhanyatraders.live:3000
```

#### Step 5: Click Verify Button
In Domain Settings page, click **Verify** next to the pending domain.

---

## 🔍 Debug Custom Domains

### Check DNS Resolution
```bash
# Check if custom domain resolves
nslookup demo.dhanyatraders.live

# Check CNAME target
dig demo.dhanyatraders.live CNAME

# Check A record
dig demo.dhanyatraders.live A
```

### Check Caddy Configuration
```bash
# Verify Caddyfile syntax
caddy validate --config Caddyfile

# Check if domain is being routed
curl -I -H "Host: demo.dhanyatraders.live" http://localhost
```

### Monitor Caddy Logs
```bash
# Watch Caddy logs in real-time
pm2 logs caddy

# Or directly
tail -f logs/caddy-out-0.log
```

---

## 📊 Current Tenants & Domains

### Existing Tenants
| ID | Company | Subdomain | Custom Domain | Status |
|----|---------|-----------|---------------|--------|
| 1 | Dhanya Traders | client1 | demo.dhanyatraders.live | ✅ Active |
| 2 | Tech Startup Inc | client2 | (none) | ✅ Active |
| 3 | lala land | lalaland | (none) | ✅ Active |

### Existing Custom Domains
| Domain | Tenant | Status |
|--------|--------|--------|
| demo.dhanyatraders.live | Dhanya Traders (ID: 1) | ✅ Verified |

### Add New Tenant via Admin

1. Log in as superadmin: `admin/admin123`
2. Go to: http://localhost:3000/admin
3. Fill form:
   - Company: `Your Company`
   - Subdomain: `yourcompany` (will create: yourcompany.plantgen.live)
   - Email: `admin@yourcompany.com`
   - Theme Color: `#FF5733`
4. Click **Create Tenant**
5. New subdomain: http://yourcompany.plantgen.live:3000

---

## 🔐 Multi-Tenant Data Isolation

### User Accounts
- **Superadmin**: `admin` / `admin123` - Can create tenants, see all users
- **Tenant Admin**: Can only manage their tenant's domains and users
- **Tenant Users**: Can view dashboard but not modify settings

### Data Files
```
backend/data/
├── tenants.json       # All tenant configurations
├── users.json         # All user accounts (with tenantId)
└── domains.json       # All custom domains (with tenantId)
```

### Tenant Isolation Rules
- Each API endpoint checks `tenantId` in request
- Users can only access their own tenant's data
- JWT token includes user's tenantId for verification

---

## 🧪 API Testing

### Test Multi-Tenant Resolution

**Resolve by Subdomain:**
```bash
curl -X POST http://localhost:8000/api/tenant/resolve \
  -H "Content-Type: application/json" \
  -d '{"hostname":"client1.plantgen.live"}'

# Response:
{
  "id": 1,
  "company": "Dhanya Traders",
  "subdomain": "client1",
  "customDomain": "demo.dhanyatraders.live",
  ...
}
```

**Resolve by Custom Domain:**
```bash
curl -X POST http://localhost:8000/api/tenant/resolve \
  -H "Content-Type: application/json" \
  -d '{"hostname":"demo.dhanyatraders.live"}'

# Response: (same Dhanya Traders tenant)
```

### Test Domain Operations

**Add Custom Domain:**
```bash
curl -X POST http://localhost:8000/api/domain/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tenantId":2,"domain":"techstartup.com"}'

# Response:
{
  "domain": "techstartup.com",
  "verification": {
    "method": "CNAME",
    "target": "client2.plantgen.live",
    "instructions": [...]
  }
}
```

**Get Tenant's Domains:**
```bash
curl -X GET http://localhost:8000/api/domain/tenant/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verify Domain:**
```bash
curl -X POST http://localhost:8000/api/domain/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tenantId":1,"domain":"techstartup.com"}'
```

---

## 🚀 Production Deployment

### 1. Domain Setup
- [ ] Point your domain's A record to your server IP
- [ ] Configure wildcard DNS: `*.yourdomain.com` → Server IP
- [ ] Wait for DNS propagation (5-30 minutes)

### 2. Update Configuration
```bash
# backend/.env
JWT_SECRET=your-secret-key-here
NODE_ENV=production

# Update Caddyfile
vim caddy/Caddyfile
# Replace plantgen.live with yourdomain.com
```

### 3. Start Services
```bash
pm2 start ecosystem.config.js
pm2 save  # Save process list
```

### 4. Enable Auto-restart on Reboot
```bash
pm2 startup
pm2 save
```

### 5. Monitor Health
```bash
# Check all processes
pm2 status

# View logs
pm2 logs

# Monitor memory usage
pm2 monit
```

---

## 🐛 Troubleshooting

### Issue: Subdomain not resolving
**Solution:**
1. Check DNS: `nslookup client1.yourdomain.com`
2. Verify A record is set in domain registrar
3. Wait 5-30 minutes for propagation
4. Clear browser cache

### Issue: Custom domain stuck in "pending"
**Solution:**
1. Verify CNAME record: `dig yourdomain.com CNAME`
2. Wait 5-10 minutes for DNS propagation
3. Ensure pointing to correct subdomain
4. Check Caddy logs: `pm2 logs caddy`

### Issue: "Tenant not found" error
**Solution:**
1. Go to /debug page
2. Test tenant resolution
3. Check tenants.json exists: `cat backend/data/tenants.json`
4. Verify subdomain spelling matches

### Issue: HTTPS/SSL not working
**Solution:**
- Caddy handles HTTPS automatically with Let's Encrypt
- Ensure domain DNS is working first
- Check Caddy logs: `pm2 logs caddy`
- May take 1-2 minutes for certificate provisioning

---

## 📞 Support

For issues or questions:
1. Check the Debug Panel: http://localhost:3000/debug
2. Review API Reference: See API_REFERENCE.md
3. Check Caddy logs: `pm2 logs caddy`
4. Check backend logs: `pm2 logs saas-backend`
