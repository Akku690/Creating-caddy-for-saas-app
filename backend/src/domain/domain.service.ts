import { Injectable, Logger } from '@nestjs/common';
import { FileStorageService } from '../common/storage.service';
import { randomBytes } from 'node:crypto';
import { DomainConnectDto } from './domain.dto';
import dns from 'node:dns/promises';
import tls from 'node:tls';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  constructor(private readonly storage: FileStorageService) {
    // start background poller immediately so existing pending domains get checked
    try {
      this.startPoller();
    } catch (e) {
      this.logger.error('Failed to start domain poller in constructor: ' + String(e));
    }
  }

  // Start a background poller to verify pending domains periodically
  // Runs every 60 seconds and attempts DNS -> SSL verification
  private readonly pollIntervalMs = 60_000;
  private pollerStarted = false;

  private startPoller() {
    if (this.pollerStarted) return;
    this.pollerStarted = true;
    setInterval(() => {
      this.pollPendingDomains().catch((e) =>
        this.logger.error('Error during domain polling: ' + String(e)),
      );
    }, this.pollIntervalMs);
  }

  async getAllDomains() {
    return this.storage.readJSON('domains');
  }

  async getDomainsByTenant(tenantId: number) {
    const domains = await this.storage.readJSON('domains');
    return domains.filter((d: any) => d.tenantId === tenantId);
  }

  async connectDomain(dto: DomainConnectDto) {
    // Generate verification token
    const verificationToken = randomBytes(16).toString('hex');
    const tenants = await this.storage.readJSON('tenants');
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

    await this.storage.create('domains', newDomain);

    // ensure background poller is running
    try {
      this.startPoller();
    } catch (e) {
      this.logger.error('Failed to start domain poller: ' + String(e));
    }

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
    const domains = await this.storage.readJSON('domains');
    const domainObj = domains.find(
      (d: any) => d.tenantId === tenantId && d.domain === domain,
    );

    if (!domainObj) {
      throw new Error('Domain not found');
    }

    // Perform actual DNS check and SSL check before marking verified
    const check = await this.checkDomainDNS(domainObj);
    if (!check.ok) {
      throw new Error('DNS verification failed');
    }

    // Optional: check SSL certificate availability
    const ssl = await this.checkDomainSSL(domain);
    domainObj.status = 'verified';
    domainObj.verifiedAt = new Date().toISOString();
    domainObj.verificationDetails = {
      dns: check,
      ssl: ssl,
    };
    await this.storage.writeJSON('domains', domains);

    // Update tenant custom domain
    const tenants = await this.storage.readJSON('tenants');
    const tenant = tenants.find((t: any) => t.id === tenantId);
    if (tenant) {
      tenant.customDomain = domain;
      await this.storage.writeJSON('tenants', tenants);
    }

    return domainObj;
  }

  // Immediately attempt to check DNS records for a domain object
  async checkDomainDNS(domainObj: any) {
    const result: any = { ok: false, method: null, found: null };
    try {
      // First try CNAME resolution
      const cnames = await dns.resolveCname(domainObj.domain).catch(() => null);
      if (cnames?.length) {
        result.method = 'CNAME';
        result.found = cnames;
        // Require an exact match to the expected target to avoid false positives
        const tenants = await this.storage.readJSON('tenants');
        const tenant = tenants.find((t: any) => t.id === domainObj.tenantId);
        const expected = tenant ? `${tenant.subdomain}.plantgen.live`.toLowerCase() : null;
        if (expected && cnames.some((c: string) => c.trim().replace(/\.$/, '').toLowerCase() === expected)) {
          result.ok = true;
          return result;
        }
      }

      // Next try TXT verification token (optional)
      const tokenName = `_mysaas-verify.${domainObj.domain}`;
      const txts = await dns.resolveTxt(tokenName).catch(() => null);
      if (txts?.length) {
        // flatten and compare to stored verificationToken
        const flattened = txts.map((arr: string[]) => arr.join(''));
        if (domainObj.verificationToken && flattened.some((value: string) => value === domainObj.verificationToken)) {
          result.method = 'TXT';
          result.found = flattened;
          result.ok = true;
          return result;
        }
      }
    } catch (e) {
      this.logger.warn('DNS check error for ' + domainObj.domain + ': ' + String(e));
    }
    return result;
  }

  // Check SSL certificate for domain by connecting to port 443 and inspecting cert
  async checkDomainSSL(domain: string) {
    try {
      return await new Promise((resolve) => {
        const socket = tls.connect(443, domain, { servername: domain, rejectUnauthorized: true, timeout: 5000 }, () => {
          try {
            const cert: any = socket.getPeerCertificate(true) || {};
            socket.end();
            const san: string = cert.subjectaltname || '';
            const cn: string = cert.subject?.CN || '';
            const hostname = domain.toLowerCase();
            const ok = Boolean(
              cn?.toLowerCase() === hostname || san?.toLowerCase().includes(hostname),
            );
            resolve({ ok, cert });
          } catch {
            resolve({ ok: false });
          }
        });
        socket.on('error', () => resolve({ ok: false }));
        socket.on('timeout', () => {
          socket.destroy();
          resolve({ ok: false });
        });
      });
    } catch {
      return { ok: false };
    }
  }

  // Poll pending domains and attempt verification
  async pollPendingDomains() {
    const domains = await this.storage.readJSON('domains');
    const pending = domains.filter((d: any) => d.status === 'pending');
    if (!pending.length) return;
    this.logger.log(`Polling ${pending.length} pending domains`);
    for (const d of pending) {
      try {
        const check = await this.checkDomainDNS(d);
        if (check.ok) {
          const ssl = await this.checkDomainSSL(d.domain);
          d.status = 'verified';
          d.verifiedAt = new Date().toISOString();
          d.verificationDetails = { dns: check, ssl };
          // update tenant
          const tenants = await this.storage.readJSON('tenants');
          const tenant = tenants.find((t: any) => t.id === d.tenantId);
          if (tenant) {
            tenant.customDomain = d.domain;
            await this.storage.writeJSON('tenants', tenants);
          }
          await this.storage.writeJSON('domains', domains);
          this.logger.log(`Domain verified automatically: ${d.domain}`);
        }
      } catch (e) {
        this.logger.warn('Polling failed for ' + d.domain + ': ' + String(e));
      }
    }
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
