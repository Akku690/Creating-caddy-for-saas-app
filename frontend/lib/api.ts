import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  verify: (token: string) => api.post('/api/auth/verify', { token }),
};

export const tenantAPI = {
  getAll: () => api.get('/api/tenant'),
  getById: (id: number) => api.get(`/api/tenant/${id}`),
  resolve: (hostname: string) =>
    api.post('/api/tenant/resolve', { hostname }),
  create: (data: any) => api.post('/api/tenant', data),
};

export const domainAPI = {
  getAll: () => api.get('/api/domain'),
  getByTenant: (tenantId: number) =>
    api.get(`/api/domain/tenant/${tenantId}`),
  connect: (tenantId: number, domain: string) =>
    api.post('/api/domain/connect', { tenantId, domain }),
  verify: (tenantId: number, domain: string) =>
    api.post('/api/domain/verify', { tenantId, domain }),
  getVerification: (domain: string) =>
    api.get(`/api/domain/verification/${domain}`),
};

export default api;
