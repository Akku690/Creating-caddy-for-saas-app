'use client';

import { useState, useEffect } from 'react';
import { tenantAPI, domainAPI } from '@/lib/api';
import { Card, Button } from '@/app/components/UI';

export default function DebugPage() {
  const [hostname, setHostname] = useState('');
  const [tenantResolution, setTenantResolution] = useState<any>(null);
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [allDomains, setAllDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
      loadDebugData();
    }
  }, []);

  const loadDebugData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, domainsRes] = await Promise.all([
        tenantAPI.getAll(),
        domainAPI.getAll(),
      ]);
      setAllTenants(tenantsRes.data);
      setAllDomains(domainsRes.data);
    } catch (error) {
      console.error('Error loading debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTenant = async () => {
    if (!hostname) return;
    setLoading(true);
    try {
      const response = await tenantAPI.resolve(hostname);
      setTenantResolution(response.data);
    } catch (error: any) {
      setTenantResolution({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <h1 className="text-3xl font-bold mb-6">🔧 Multi-Tenant Debug Panel</h1>

          {/* Tenant Resolution */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold mb-4">📍 Tenant Resolution</h2>
            <p className="mb-4">Current hostname: <code className="bg-gray-200 px-2 py-1 rounded">{hostname}</code></p>
            <Button onClick={handleResolveTenant} disabled={loading}>
              {loading ? 'Resolving...' : 'Resolve Tenant'}
            </Button>
            {tenantResolution && (
              <pre className="mt-4 bg-white p-4 rounded border border-blue-300 overflow-auto max-h-96">
                {JSON.stringify(tenantResolution, null, 2)}
              </pre>
            )}
          </div>

          {/* All Tenants */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-2xl font-bold mb-4">👥 All Tenants ({allTenants.length})</h2>
            <div className="space-y-4">
              {allTenants.map((tenant: any) => (
                <div key={tenant.id} className="bg-white p-4 rounded border-l-4 border-green-500">
                  <p className="font-bold">{tenant.company}</p>
                  <p className="text-sm text-gray-600">Subdomain: {tenant.subdomain}</p>
                  <p className="text-sm text-gray-600">Custom Domain: {tenant.customDomain || '(none)'}</p>
                  <p className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {tenant.subdomain}.plantgen.live
                    </code>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* All Domains */}
          <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h2 className="text-2xl font-bold mb-4">🌐 All Custom Domains ({allDomains.length})</h2>
            <div className="space-y-4">
              {allDomains.map((domain: any) => (
                <div key={domain.id} className="bg-white p-4 rounded border-l-4 border-purple-500">
                  <p className="font-bold">{domain.domain}</p>
                  <p className="text-sm text-gray-600">Tenant ID: {domain.tenantId}</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={domain.status === 'verified' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>{domain.status}</span>
                  </p>
                  <p className="text-sm text-gray-600">Type: {domain.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testing Guide */}
          <div className="p-6 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-bold mb-4">📖 Testing Guide</h2>
            <div className="space-y-3 text-sm">
              <p><strong>Subdomain Testing (local):</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Edit your /etc/hosts: <code>127.0.0.1 client1.localhost</code></li>
                <li>Or use: <code>http://client1.plantgen.live</code> (if DNS is configured)</li>
              </ul>
              <p className="mt-3"><strong>API Endpoints:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code>POST /api/tenant/resolve</code> - Resolve by hostname</li>
                <li><code>GET /api/domain/tenant/:id</code> - Get domains for tenant</li>
                <li><code>POST /api/domain/connect</code> - Add custom domain</li>
                <li><code>POST /api/domain/verify</code> - Verify custom domain</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
