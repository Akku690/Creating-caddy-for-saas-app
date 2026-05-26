# API Reference

Complete API documentation with examples.

## Base URL

**Development:** `http://localhost:8000`  
**Production:** `https://api.plantgen.live`

## Authentication

All requests except `/api/auth/login` require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/endpoint
```

## Health Check

### GET /health

Quick health check endpoint.

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInRlbmFudElkIjpudWxsLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcwNTMxOTQ0NSwiZXhwIjoxNzA2MTgzNDQ1fQ.xyz",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@plantgen.live",
    "tenantId": null,
    "role": "superadmin"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Demo Credentials:**
| Username | Password | Role | Tenant |
|----------|----------|------|--------|
| admin | admin123 | superadmin | None |
| client1admin | password123 | admin | 1 |
| client2admin | password123 | admin | 2 |

---

### POST /api/auth/verify

Verify JWT token validity.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK - Valid):**
```json
{
  "valid": true,
  "payload": {
    "id": 1,
    "username": "admin",
    "tenantId": null,
    "role": "superadmin",
    "iat": 1705319445,
    "exp": 1706183445
  }
}
```

**Response (200 OK - Invalid):**
```json
{
  "valid": false
}
```

---

## Tenant Endpoints

### GET /api/tenant

Get all tenants.

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/tenant
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "company": "Dhanya Traders",
    "subdomain": "client1",
    "customDomain": "demo.dhanyatraders.live",
    "themeColor": "#16a34a",
    "logo": "https://via.placeholder.com/150",
    "email": "admin@dhanyatraders.com",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "company": "Tech Startup Inc",
    "subdomain": "client2",
    "customDomain": "",
    "themeColor": "#0066cc",
    "logo": "https://via.placeholder.com/150",
    "email": "admin@techstartup.com",
    "status": "active",
    "createdAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### GET /api/tenant/:id

Get tenant by ID.

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/tenant/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "company": "Dhanya Traders",
  "subdomain": "client1",
  "customDomain": "demo.dhanyatraders.live",
  "themeColor": "#16a34a",
  "logo": "https://via.placeholder.com/150",
  "email": "admin@dhanyatraders.com",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
null
```

---

### POST /api/tenant/resolve

Resolve tenant from hostname. **No authentication required.**

**Request:**
```bash
curl -X POST http://localhost:8000/api/tenant/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "client1.plantgen.live"
  }'
```

**Response (200 OK - Found):**
```json
{
  "id": 1,
  "company": "Dhanya Traders",
  "subdomain": "client1",
  "customDomain": "demo.dhanyatraders.live",
  "themeColor": "#16a34a",
  "logo": "https://via.placeholder.com/150",
  "email": "admin@dhanyatraders.com",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (200 OK - Main Site):**
```json
{
  "isMainSite": true
}
```

**Response (200 OK - Not Found):**
```json
null
```

---

### POST /api/tenant

Create new tenant. **Admin only.**

**Request:**
```bash
curl -X POST http://localhost:8000/api/tenant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "New Company Ltd",
    "subdomain": "newco",
    "email": "admin@newco.com",
    "themeColor": "#FF5733",
    "logo": "https://example.com/logo.png"
  }'
```

**Response (201 Created):**
```json
{
  "id": 3,
  "company": "New Company Ltd",
  "subdomain": "newco",
  "themeColor": "#FF5733",
  "logo": "https://example.com/logo.png",
  "email": "admin@newco.com",
  "status": "active",
  "createdAt": "2024-01-15T10:30:45.000Z"
}
```

**Required Fields:**
- `company` (string)
- `subdomain` (string)
- `email` (string)

**Optional Fields:**
- `themeColor` (hex color, default: #000000)
- `logo` (URL, default: placeholder)

---

## Domain Endpoints

### GET /api/domain

Get all domains.

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/domain
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "tenantId": 1,
    "domain": "demo.dhanyatraders.live",
    "type": "custom",
    "status": "verified",
    "verificationToken": "abc123xyz789",
    "verificationMethod": "CNAME",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "verifiedAt": "2024-01-02T10:30:00.000Z"
  }
]
```

---

### GET /api/domain/tenant/:tenantId

Get all domains for specific tenant.

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/domain/tenant/1
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "tenantId": 1,
    "domain": "demo.dhanyatraders.live",
    "type": "custom",
    "status": "verified",
    "verificationToken": "abc123xyz789",
    "verificationMethod": "CNAME",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "verifiedAt": "2024-01-02T10:30:00.000Z"
  }
]
```

---

### GET /api/domain/verification/:domain

Get DNS verification instructions for domain.

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/domain/verification/demo.dhanyatraders.live
```

**Response (200 OK):**
```json
{
  "domain": "demo.dhanyatraders.live",
  "verification": {
    "CNAME": {
      "name": "_acme-challenge.demo.dhanyatraders.live",
      "value": "client1.plantgen.live"
    },
    "TXT": {
      "name": "_mysaas-verify.demo.dhanyatraders.live",
      "value": "verification-token-here"
    }
  }
}
```

---

### POST /api/domain/connect

Connect custom domain to tenant.

**Request:**
```bash
curl -X POST http://localhost:8000/api/domain/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "domain": "mycompany.com"
  }'
```

**Response (201 Created):**
```json
{
  "domain": "mycompany.com",
  "verification": {
    "method": "CNAME",
    "target": "client1.plantgen.live",
    "instructions": [
      "Add a CNAME record for: mycompany.com",
      "Point to: client1.plantgen.live",
      "Wait 5-10 minutes for DNS propagation",
      "Then click Verify Domain button"
    ]
  }
}
```

**Request Body:**
- `tenantId` (number, required)
- `domain` (string, required, must be valid domain)

---

### POST /api/domain/verify

Verify custom domain DNS records.

**Request:**
```bash
curl -X POST http://localhost:8000/api/domain/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "domain": "mycompany.com"
  }'
```

**Response (200 OK):**
```json
{
  "id": 2,
  "tenantId": 1,
  "domain": "mycompany.com",
  "type": "custom",
  "status": "verified",
  "verificationToken": "xyz789abc123",
  "verificationMethod": "CNAME",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "verifiedAt": "2024-01-15T10:35:30.000Z"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Domain not found"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized - missing or invalid token"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Request/Response Headers

### Recommended Headers

```bash
curl -X POST http://localhost:8000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

### Response Headers

All responses include:
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`

---

## Rate Limiting

Currently **not implemented** for demo. Recommended for production:

```
- 100 requests per minute per IP
- 10 login attempts per minute
- Exponential backoff on failures
```

---

## Pagination (Future)

Responses currently return all records. For production, implement:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "perPage": 20,
  "pages": 5
}
```

Query: `GET /api/tenant?page=1&limit=20`

---

## Testing with Postman

1. **Import Collection:**
   - New → Collection
   - Add all endpoints below

2. **Set Variables:**
   - `baseUrl` = `http://localhost:8000`
   - `token` = (from login response)

3. **Create Requests:**

```
Login
POST {{baseUrl}}/api/auth/login

Get Tenants
GET {{baseUrl}}/api/tenant
Header: Authorization: Bearer {{token}}

Create Tenant
POST {{baseUrl}}/api/tenant
Header: Authorization: Bearer {{token}}
Body: {"company": "...", "subdomain": "...", "email": "..."}
```

---

## cURL Examples

### Login and Save Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

echo $TOKEN
```

### Make Authenticated Request

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/tenant
```

### Complete Example: Create Tenant

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# 2. Create tenant
curl -X POST http://localhost:8000/api/tenant \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Test Corp",
    "subdomain": "testcorp",
    "email": "admin@testcorp.com",
    "themeColor": "#FF0000"
  }' | jq
```

---

## Response Times

Expected response times:

| Endpoint | Time |
|----------|------|
| Health check | <10ms |
| Login | 50-100ms |
| Get tenants | 20-50ms |
| Create tenant | 50-100ms |
| Resolve tenant | 20-50ms |
| Connect domain | 100-200ms |

---

**Last Updated:** 2024  
**API Version:** 1.0.0
