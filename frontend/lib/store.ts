import { create } from 'zustand';

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
  allTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant | null) => void;
  setAllTenants: (tenants: Tenant[]) => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
  currentTenant: null,
  allTenants: [],
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  setAllTenants: (tenants) => set({ allTenants: tenants }),
}));
