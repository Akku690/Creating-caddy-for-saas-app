import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../common/storage.service';
import { randomBytes } from 'crypto';
import { DomainConnectDto } from './domain.dto';

@Injectable()
export class DomainService {
  constructor(private storage: FileStorageService) {}

  async getAllDomains() {
    return this.storage.readJSON('domains');
  }

  async getDomainsByTenant(tenantId: number) {
    const domains = this.storage.readJSON('domains');
    return domains.filter((d: any) => d.tenantId === tenantId);
  }

  async connectDomain(dto: DomainConnectDto) {
    // Generate verification token
    const verificationToken = randomBytes(16).toString('hex');
    const tenants = this.storage.readJSON('tenants');
    const tenant = tenants.find((t: any) => t.id === dto.tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const newDomain = {
      tenantId: dto.tenantId,
      domain: dto.domain,
      type: 'custom',
      status: 'pending',
      verificationToken: verificationToken,
      verificationMethod: 'CNAME',
      createdAt: new Date().toISOString(),
    };

    this.storage.create('domains', newDomain);

    return {
      domain: dto.domain,
      verification: {
        method: 'CNAME',
        target: `${tenant.subdomain}.plantgen.live`,
        instructions: [
          `Add a CNAME record for: ${dto.domain}`,
          `Point to: ${tenant.subdomain}.plantgen.live`,
          'Wait 5-10 minutes for DNS propagation',
          'Then click Verify Domain button',
        ],
      },
    };
  }

  async verifyDomain(tenantId: number, domain: string) {
    const domains = this.storage.readJSON('domains');
    const domainObj = domains.find(
      (d: any) => d.tenantId === tenantId && d.domain === domain,
    );

    if (!domainObj) {
      throw new Error('Domain not found');
    }

    // In production, you would actually check DNS records
    // For demo, we'll just mark it as verified
    domainObj.status = 'verified';
    domainObj.verifiedAt = new Date().toISOString();
    this.storage.writeJSON('domains', domains);

    // Update tenant custom domain
    const tenants = this.storage.readJSON('tenants');
    const tenant = tenants.find((t: any) => t.id === tenantId);
    if (tenant) {
      tenant.customDomain = domain;
      this.storage.writeJSON('tenants', tenants);
    }

    return domainObj;
  }

  async getDomainVerification(domain: string) {
    return {
      domain: domain,
      verification: {
        CNAME: {
          name: `_acme-challenge.${domain}`,
          value: 'client1.plantgen.live',
        },
        TXT: {
          name: `_mysaas-verify.${domain}`,
          value: 'verification-token-here',
        },
      },
    };
  }
}
