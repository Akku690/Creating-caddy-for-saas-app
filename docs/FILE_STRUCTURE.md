# Project File Structure

## Complete Directory Map

```
Creating-caddy-for-saas-app/
│
├── README.md                    # Main project documentation
├── .gitignore                   # Git ignore rules
├── ecosystem.config.js          # pm2 configuration
│
├── backend/                     # NestJS Backend Application
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .env.example            # Environment template
│   │
│   ├── src/                    # Source code
│   │   ├── main.ts            # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── app.controller.ts   # Root controller
│   │   │
│   │   ├── auth/              # Authentication Module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.dto.ts
│   │   │
│   │   ├── tenant/            # Tenant Module
│   │   │   ├── tenant.module.ts
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.controller.ts
│   │   │   └── tenant.dto.ts
│   │   │
│   │   ├── domain/            # Domain Module
│   │   │   ├── domain.module.ts
│   │   │   ├── domain.service.ts
│   │   │   ├── domain.controller.ts
│   │   │   └── domain.dto.ts
│   │   │
│   │   └── common/            # Shared Services
│   │       ├── storage.service.ts  # JSON file storage
│   │       └── jwt.service.ts      # JWT handling
│   │
│   └── data/                   # JSON Data Files
│       ├── tenants.json       # Tenant records
│       ├── users.json         # User credentials
│       └── domains.json       # Domain mappings
│
├── frontend/                    # Next.js Frontend Application
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.js       # PostCSS config
│   ├── .env.local.example      # Environment template
│   ├── middleware.ts           # Tenant detection middleware
│   │
│   ├── app/                    # Next.js App Directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Tenant dashboard
│   │   │
│   │   ├── domain-settings/
│   │   │   └── page.tsx        # Domain management
│   │   │
│   │   ├── admin/
│   │   │   └── page.tsx        # Admin panel
│   │   │
│   │   └── components/
│   │       ├── Navigation.tsx  # Header navigation
│   │       ├── UI.tsx         # UI components
│   │       └── ProtectedLayout.tsx # Auth wrapper
│   │
│   └── lib/                    # Utility Functions
│       ├── api.ts             # Axios API client
│       └── store.ts           # Zustand state management
│
├── caddy/                       # Caddy Configuration
│   ├── Caddyfile              # Reverse proxy config
│   ├── run-caddy.sh           # Caddy startup script
│   └── setup.sh               # Installation script
│
├── docs/                        # Documentation
│   ├── QUICK_START.md         # 5-minute setup
│   ├── COMPLETE_GUIDE.md      # Full documentation
│   ├── UBUNTU_DEPLOYMENT.md   # Production deployment
│   ├── API_REFERENCE.md       # API documentation
│   └── FILE_STRUCTURE.md      # This file
│
└── logs/                        # Application logs (created at runtime)
    ├── backend-out.log
    ├── backend-error.log
    ├── frontend-out.log
    ├── frontend-error.log
    ├── caddy-out.log
    └── caddy-error.log
```

## Key Files Explained

### Backend Core

| File | Purpose |
|------|---------|
| `backend/src/main.ts` | Application bootstrap & CORS setup |
| `backend/src/app.module.ts` | Root module importing all features |
| `backend/data/*.json` | JSON file storage for all data |

### Frontend Core

| File | Purpose |
|------|---------|
| `frontend/app/layout.tsx` | Root layout wrapper |
| `frontend/middleware.ts` | Hostname-based tenant detection |
| `frontend/lib/api.ts` | Axios client with auto-token injection |
| `frontend/lib/store.ts` | Zustand state management |

### Configuration

| File | Purpose |
|------|---------|
| `backend/tsconfig.json` | TypeScript compiler options |
| `frontend/next.config.js` | Next.js framework options |
| `frontend/tailwind.config.js` | Tailwind CSS theme |
| `caddy/Caddyfile` | Reverse proxy routing rules |
| `ecosystem.config.js` | pm2 process management |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICK_START.md` | 5-minute setup guide |
| `COMPLETE_GUIDE.md` | Architecture & detailed guide |
| `UBUNTU_DEPLOYMENT.md` | Production deployment steps |
| `API_REFERENCE.md` | API endpoints & examples |

## Module Organization

### Backend Modules

```
AuthModule (auth/)
├── Controllers: Handle login/verify
├── Services: User authentication, JWT
├── DTOs: Request/response validation
└── Exports: JwtService for other modules

TenantModule (tenant/)
├── Controllers: Handle tenant CRUD
├── Services: Tenant business logic
├── DTOs: Tenant data transfer
└── Exports: TenantService for domain routing

DomainModule (domain/)
├── Controllers: Handle domain operations
├── Services: Domain verification logic
├── DTOs: Domain data transfer
└── Exports: None (internal use)
```

### Frontend Pages

```
/ (Home)
├── Show landing page if mainSite
└── Show tenant dashboard if tenant subdomain

/login
├── Login form
├── Demo credentials display
└── Token storage in localStorage

/dashboard
├── Tenant company info
├── Theme color display
├── Logo display
└── Quick settings

/domain-settings
├── Add custom domain form
├── DNS instructions
├── List connected domains
└── Verify button

/admin (Super admin only)
├── Create tenant form
├── List all tenants
└── Edit tenant details
```

## Data Flow

### Login Flow
```
User fills form
    ↓
POST /api/auth/login
    ↓
Backend verifies credentials
    ↓
Returns JWT token
    ↓
Frontend stores in localStorage
    ↓
API client auto-injects in headers
```

### Multi-Tenant Resolution
```
User visits hostname
    ↓
Middleware reads hostname
    ↓
Next.js sends header to backend
    ↓
POST /api/tenant/resolve
    ↓
Backend queries tenants.json
    ↓
Returns tenant data or mainSite flag
    ↓
Frontend renders appropriate content
```

### Custom Domain Flow
```
Tenant submits domain
    ↓
POST /api/domain/connect
    ↓
Backend generates verification token
    ↓
Returns CNAME instructions
    ↓
Tenant adds DNS record
    ↓
User clicks verify
    ↓
POST /api/domain/verify
    ↓
Backend marks as verified
    ↓
Custom domain now routes to tenant
```

## Development Workflow

### Making Backend Changes

1. Edit file in `backend/src/`
2. Backend auto-rebuilds on save
3. Test with `curl` or Postman
4. Changes appear immediately

### Making Frontend Changes

1. Edit file in `frontend/app/`
2. Frontend hot-reloads on save
3. Changes appear immediately in browser
4. No rebuild needed during development

### Adding New Module

**Backend:**
```
1. Create folder: backend/src/newmodule/
2. Create files:
   - newmodule.module.ts
   - newmodule.service.ts
   - newmodule.controller.ts
   - newmodule.dto.ts
3. Import in app.module.ts
```

**Frontend:**
```
1. Create folder: frontend/app/newpage/
2. Create files:
   - page.tsx (default export)
3. Automatic routing to /newpage
```

## Environment Files

### Backend .env
```env
PORT=8000
NODE_ENV=development
JWT_SECRET=demo-secret
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Logs Location

```
During Development:
- Backend: console output
- Frontend: console output
- Caddy: console output

During Production (pm2):
logs/
├── backend-out.log
├── backend-error.log
├── frontend-out.log
├── frontend-error.log
├── caddy-out.log
└── caddy-error.log
```

View with:
```bash
pm2 logs               # All logs
pm2 logs saas-backend # Backend only
tail -f logs/backend-out.log
```

## Performance Considerations

### Frontend
- Static assets cached by Caddy
- Next.js builds with code splitting
- API calls cached with Axios interceptors
- Images lazy-loaded

### Backend
- pm2 clustering for multiple instances
- Each instance runs on same port (load balanced)
- JSON files used (fast for demo)
- Would benefit from database for production

## Scaling Architecture

```
Current (Single Server):
User → Caddy → Node:3000 → API:8000 → JSON files

Scalable (Multiple Servers):
Users → Load Balancer
        ├─ Server 1 (Frontend + Backend cluster)
        ├─ Server 2 (Frontend + Backend cluster)
        └─ Server 3 (Backend cluster only)
        
With Database:
        ↓
    PostgreSQL (Shared)
```

## File Sizes (Approximate)

| Component | Size |
|-----------|------|
| Backend dist/ | ~2-3 MB |
| Frontend .next/ | ~5-8 MB |
| node_modules | ~400-500 MB |
| Data files (JSON) | ~5-20 KB |
| Total (production) | ~50-100 MB |

## Important Notes

1. **JSON files are stored in backend/data/**
2. **Build outputs go to dist/ and .next/**
3. **node_modules are gitignored (run npm install)**
4. **Environment files must be created from .example**
5. **pm2 looks for ecosystem.config.js in root**
6. **Caddy config at /etc/caddy/Caddyfile in production**

---

**Last Updated:** 2024  
**Structure Version:** 1.0.0
