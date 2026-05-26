'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useTenantStore } from '@/lib/store';
import { tenantAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { ProtectedLayout } from '@/app/components/ProtectedLayout';
import { Card, Button } from '@/app/components/UI';

function DashboardContent() {
  const { user } = useAuthStore();
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        if (user?.tenantId) {
          const response = await tenantAPI.getById(user.tenantId);
          setCurrentTenant(response.data);
        } else {
          const hostname =
            typeof window !== 'undefined' ? window.location.hostname : '';
          const response = await tenantAPI.resolve(hostname);
          if (response.data && !response.data.isMainSite) {
            setCurrentTenant(response.data);
          }
        }
      } catch (error) {
        console.error('Error resolving tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    resolveTenant();
  }, [user, setCurrentTenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {currentTenant && (
            <>
              <Card className="mb-8">
                <div className="flex items-center space-x-6">
                  <img
                    src={currentTenant.logo}
                    alt={currentTenant.company}
                    className="h-24 w-24 rounded-lg"
                  />
                  <div>
                    <h1 className="text-4xl font-bold">
                      {currentTenant.company}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Subdomain: {currentTenant.subdomain}.plantgen.live
                    </p>
                    {currentTenant.customDomain && (
                      <p className="text-gray-600">
                        Custom Domain: {currentTenant.customDomain}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                  <p className="text-gray-600 mb-4">
                    Welcome to your dedicated tenant dashboard
                  </p>
                  <div
                    style={{ backgroundColor: currentTenant.themeColor }}
                    className="h-32 rounded-lg"
                  ></div>
                </Card>

                <Card>
                  <h2 className="text-2xl font-bold mb-4">Quick Info</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Theme Color:</span>
                      <span className="ml-2 font-mono">
                        {currentTenant.themeColor}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <Button onClick={() => (window.location.href = '/domain-settings')}>
                  Manage Domains
                </Button>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  );
}
