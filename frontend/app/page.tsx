'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useTenantStore } from '@/lib/store';
import { tenantAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button } from '@/app/components/UI';

export default function Home() {
  const { user } = useAuthStore();
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const response = await tenantAPI.resolve(hostname);
        if (response.data && !response.data.isMainSite) {
          setCurrentTenant(response.data);
        } else {
          setCurrentTenant(null);
        }
      } catch (error) {
        console.error('Error resolving tenant:', error);
        setCurrentTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolveTenant();
  }, [setCurrentTenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (currentTenant && !user?.role?.includes('admin')) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card className="text-center">
              <div
                style={{ backgroundColor: currentTenant.themeColor }}
                className="h-32 rounded-lg mb-6 flex items-center justify-center"
              >
                <img
                  src={currentTenant.logo}
                  alt={currentTenant.company}
                  className="max-h-24"
                />
              </div>
              <h1 className="text-4xl font-bold mb-2">{currentTenant.company}</h1>
              <p className="text-gray-600 mb-6">
                Welcome to your dedicated portal
              </p>
              {user ? (
                <p className="text-lg text-green-600">You are logged in!</p>
              ) : (
                <Button>Get Started</Button>
              )}
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">PlantGen SaaS</h1>
            <p className="text-xl text-gray-600">
              Complete multi-tenant solution for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="text-center">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">Multi-Tenant</h3>
                <p className="text-gray-600">
                  Manage multiple clients with separate subdomains
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold mb-2">Custom Domains</h3>
                <p className="text-gray-600">
                  Connect your own domains with automatic verification
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-gray-600">
                  Built with JWT authentication and CORS protection
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            {user ? (
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => window.location.href = '/login'}>
                Login to Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
