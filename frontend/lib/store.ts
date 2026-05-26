import create from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  tenantId: number | null;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
}));

interface Tenant {
  id: number;
  company: string;
  subdomain: string;
  customDomain?: string;
  themeColor: string;
  logo: string;
  status: string;
}

interface TenantStore {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
  currentTenant: null,
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
}));
