'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { tenantAPI, domainAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { ProtectedLayout } from '@/app/components/ProtectedLayout';
import { Card, Button, Input } from '@/app/components/UI';

function DomainSettingsContent() {
  const { user } = useAuthStore();
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    if (!user?.tenantId) return;
    try {
      const response = await domainAPI.getByTenant(user.tenantId);
      setDomains(response.data);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const handleConnectDomain = async () => {
    if (!user?.tenantId || !newDomain) return;

    setIsLoading(true);
    try {
      const response = await domainAPI.connect(user.tenantId, newDomain);
      setMessage(
        `✅ Domain connection initiated!\n\nDNS Instructions:\n${response.data.verification.instructions.join('\n')}`
      );
      setNewDomain('');
      setTimeout(loadDomains, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error connecting domain';
      setMessage(`❌ ${errorMsg}`);
      console.error('Domain connect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDomain = async (domain: string) => {
    if (!user?.tenantId) return;

    setIsLoading(true);
    try {
      const response = await domainAPI.verify(user.tenantId, domain);
      setMessage(`✅ Domain "${domain}" verified successfully!`);
      setTimeout(loadDomains, 2000);
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
                        {domain.status === 'pending' && (
                          <Button
                            onClick={() => handleVerifyDomain(domain.domain)}
                            disabled={isLoading}
                          >
                            Verify
                          </Button>
                        )}
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
  return (
    <ProtectedLayout>
      <DomainSettingsContent />
    </ProtectedLayout>
  );
}
