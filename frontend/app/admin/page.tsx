'use client';

import { useState, useEffect } from 'react';
import { tenantAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button, Input } from '@/app/components/UI';

function AdminContent() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [newTenant, setNewTenant] = useState({
    company: '',
    subdomain: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await tenantAPI.getAll();
      setTenants(response.data);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.company || !newTenant.subdomain || !newTenant.email) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await tenantAPI.create(newTenant);
      setMessage('Tenant created successfully!');
      setNewTenant({ company: '', subdomain: '', email: '' });
      setTimeout(loadTenants, 1000);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || 'Error creating tenant'
      );
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
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {message && (
              <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                {message}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Create New Tenant</h2>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  placeholder="e.g., Acme Corp"
                  value={newTenant.company}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      company: e.target.value,
                    })
                  }
                />
                <Input
                  label="Subdomain"
                  placeholder="e.g., acme"
                  value={newTenant.subdomain}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      subdomain: e.target.value,
                    })
                  }
                />
                <Input
                  label="Email"
                  placeholder="admin@example.com"
                  type="email"
                  value={newTenant.email}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      email: e.target.value,
                    })
                  }
                />
                <Button
                  onClick={handleCreateTenant}
                  disabled={isLoading}
                >
                  Create Tenant
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">All Tenants</h2>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <Card key={tenant.id} className="bg-gray-100">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-bold">{tenant.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Subdomain</p>
                        <p className="font-bold">{tenant.subdomain}.plantgen.live</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-bold text-sm">{tenant.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-bold text-green-600">{tenant.status}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Admin() {
  return <AdminContent />;
}
