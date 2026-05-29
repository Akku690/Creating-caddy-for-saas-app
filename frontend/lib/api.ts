import axios from 'axios';

const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return 'http://localhost:8000';
  }

  return '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
});

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

export const pageAPI = {
  getAll: () => api.get('/api/page'),
  getByTenant: (tenantId: number) =>
    api.get(`/api/page/tenant/${tenantId}`),
  getById: (id: number) => api.get(`/api/page/${id}`),
  create: (data: any) => api.post('/api/page', data),
  update: (id: number, data: any) => api.put(`/api/page/${id}`, data),
  delete: (id: number, tenantId: number) =>
    api.delete(`/api/page/${id}`, { data: { tenantId } }),
};

export default api;
