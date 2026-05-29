'use client';

import { useState, useEffect } from 'react';
import { useTenantStore } from '@/lib/store';
import { tenantAPI, domainAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button, Input } from '@/app/components/UI';

function DomainSettingsContent() {
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationInfo, setVerificationInfo] = useState<any>(null);

  useEffect(() => {
    resolveTenant();
  }, []);

  const resolveTenant = async () => {
    if (currentTenant) {
      await loadDomains(currentTenant.id);
      return;
    }

    // Check localStorage for previously created tenant (persisted by dashboard)
    const stored = typeof window !== 'undefined' ? localStorage.getItem('currentTenant') : null;
    if (stored) {
      try {
        const tenant = JSON.parse(stored);
        setCurrentTenant(tenant);
        await loadDomains(tenant.id);
        return;
      } catch (err) {
        console.warn('Invalid stored tenant', err);
      }
    }
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const response = await tenantAPI.resolve(hostname);
      if (response.data && !response.data.isMainSite) {
        setCurrentTenant(response.data);
        await loadDomains(response.data.id);
      }
    } catch (error) {
      console.error('Error resolving tenant:', error);
    }
  };

  const loadDomains = async (tenantId: number) => {
    try {
      const response = await domainAPI.getByTenant(tenantId);
      setDomains(response.data);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const handleConnectDomain = async () => {
    if (!currentTenant || !newDomain) return;

    setIsLoading(true);
    try {
      const response = await domainAPI.connect(currentTenant.id, newDomain);
      setVerificationInfo({
        domain: response.data.domain,
        verification: response.data.verification,
      });
      setMessage('✅ Domain connection initiated! See instructions below.');
      setNewDomain('');
      setTimeout(() => loadDomains(currentTenant.id), 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error connecting domain';
      setMessage(`❌ ${errorMsg}`);
      console.error('Domain connect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowVerification = async (domain: string) => {
    try {
      const resp = await domainAPI.getVerification(domain);
      setVerificationInfo(resp.data);
      setMessage('');
    } catch (err) {
      console.error('Error fetching verification:', err);
      setMessage('❌ Could not fetch verification details');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      setMessage('Could not copy to clipboard');
    }
  };

  const handleVerifyDomain = async (domain: string) => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      const response = await domainAPI.verify(currentTenant.id, domain);
      // Refresh domains list and tenant info so UI reflects the verified custom domain
      await loadDomains(currentTenant.id);
      try {
        const tenantResp = await tenantAPI.getById(currentTenant.id);
        setCurrentTenant(tenantResp.data);
        localStorage.setItem('currentTenant', JSON.stringify(tenantResp.data));
      } catch (tErr) {
        console.warn('Could not refresh tenant after domain verify', tErr);
      }
      setMessage(`✅ Domain "${domain}" verified successfully!`);
      // clear verification panel if it was showing this domain
      if (verificationInfo && verificationInfo.domain === domain) {
        setVerificationInfo(null);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error verifying domain';
      setMessage(`❌ ${errorMsg}. Ensure DNS CNAME record is set up correctly.`);
      console.error('Domain verify error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Domain Settings</h1>

            {message && (
              <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg whitespace-pre-wrap">
                {message}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Add Custom Domain</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleConnectDomain}
                  disabled={isLoading}
                >
                  Connect
                </Button>
              </div>
            </div>

            {/* Verification Instructions Panel */}
            {verificationInfo && (
              <Card className="mb-8 bg-yellow-50 border-yellow-200">
                <h3 className="font-bold text-lg mb-2">DNS Verification Instructions for {verificationInfo.domain}</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  {verificationInfo.verification.instructions && (
                    <div>
                      <p className="font-semibold">Steps:</p>
                      <pre className="bg-white p-3 rounded border text-xs whitespace-pre-wrap">{verificationInfo.verification.instructions.join('\n')}</pre>
                    </div>
                  )}
                  {verificationInfo.verification.CNAME && (
                    <div>
                      <p className="font-semibold mt-2">CNAME Record</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white p-2 rounded border text-xs">{verificationInfo.verification.CNAME.name} → {verificationInfo.verification.CNAME.value}</code>
                        <Button onClick={() => copyToClipboard(`${verificationInfo.verification.CNAME.name} ${verificationInfo.verification.CNAME.value}`)} className="text-sm">Copy</Button>
                      </div>
                    </div>
                  )}
                  {verificationInfo.verification.TXT && (
                    <div>
                      <p className="font-semibold mt-2">TXT Record</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white p-2 rounded border text-xs">{verificationInfo.verification.TXT.name} → {verificationInfo.verification.TXT.value}</code>
                        <Button onClick={() => copyToClipboard(`${verificationInfo.verification.TXT.name} ${verificationInfo.verification.TXT.value}`)} className="text-sm">Copy</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-bold mb-4">Your Domains</h2>
              <div className="space-y-4">
                {domains.length === 0 ? (
                  <p className="text-gray-600">No custom domains connected yet</p>
                ) : (
                  domains.map((domain) => (
                    <Card key={domain.id} className="bg-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{domain.domain}</h3>
                          <p className="text-sm text-gray-600">
                            Status:{' '}
                            <span
                              className={`font-semibold ${
                                domain.status === 'verified'
                                  ? 'text-green-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              {domain.status}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {domain.status === 'pending' && (
                            <Button
                              onClick={() => handleVerifyDomain(domain.domain)}
                              disabled={isLoading}
                            >
                              Verify
                            </Button>
                          )}
                          <Button onClick={() => handleShowVerification(domain.domain)} className="text-sm">
                            Show Instructions
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function DomainSettings() {
  return <DomainSettingsContent />;
}
