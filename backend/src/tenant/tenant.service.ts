import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../common/storage.service';
import { TenantDto } from './tenant.dto';

@Injectable()
export class TenantService {
  constructor(private storage: FileStorageService) {}

  async getAllTenants() {
    return this.storage.readJSON('tenants');
  }

  async getTenantById(id: number) {
    return this.storage.findById('tenants', id);
  }

  async getTenantBySubdomain(subdomain: string) {
    const tenants = this.storage.readJSON('tenants');
    return tenants.find((t: any) => t.subdomain === subdomain);
  }

  async getTenantByCustomDomain(domain: string) {
    const tenants = this.storage.readJSON('tenants');
    return tenants.find((t: any) => t.customDomain === domain);
  }

  async resolveTenant(hostname: string) {
    // Extract subdomain from hostname
    // client1.plantgen.live -> client1
    // demo.dhanyatraders.live -> check custom domain
    // plantgen.live -> main site

    if (!hostname || hostname === 'plantgen.live' || hostname === 'localhost:3000') {
      return { isMainSite: true };
    }

    // Check if it's a custom domain
    const customDomainTenant = await this.getTenantByCustomDomain(hostname);
    if (customDomainTenant) {
      return customDomainTenant;
    }

    // Extract subdomain
    const parts = hostname.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      const tenant = await this.getTenantBySubdomain(subdomain);
      if (tenant) {
        return tenant;
      }
    }

    return null;
  }

  async createTenant(dto: TenantDto) {
    const newTenant = {
      ...dto,
      themeColor: dto.themeColor || '#000000',
      logo: dto.logo || 'https://via.placeholder.com/150',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    return this.storage.create('tenants', newTenant);
  }
}
