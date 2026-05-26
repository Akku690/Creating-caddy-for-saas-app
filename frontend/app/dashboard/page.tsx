'use client';

import { useState, useEffect } from 'react';
import { useTenantStore } from '@/lib/store';
import { tenantAPI, pageAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button, Input } from '@/app/components/UI';

function DashboardContent() {
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const [pages, setPages] = useState<any[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    resolveTenant();
  }, []);

  const resolveTenant = async () => {
    setIsLoading(true);
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const response = await tenantAPI.resolve(hostname);
      if (response.data && !response.data.isMainSite) {
        setCurrentTenant(response.data);
        await loadPages(response.data.id);
      }
    } catch (error) {
      console.error('Error resolving tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPages = async (tenantId: number) => {
    try {
      const response = await pageAPI.getByTenant(tenantId);
      setPages(response.data);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageTitle || !currentTenant) return;

    try {
      const response = await pageAPI.create({
        tenantId: currentTenant.id,
        title: newPageTitle,
        slug: newPageTitle.toLowerCase().replace(/\s+/g, '-'),
        description: '',
      });
      setMessage(`✅ Page "${newPageTitle}" created successfully!`);
      setNewPageTitle('');
      await loadPages(currentTenant.id);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error creating page`);
      console.error(error);
    }
  };

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
              {/* Header */}
              <Card className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <img
                      src={currentTenant.logo}
                      alt={currentTenant.company}
                      className="h-20 w-20 rounded-lg"
                    />
                    <div>
                      <h1 className="text-4xl font-bold">{currentTenant.company}</h1>
                      <p className="text-gray-600 mt-2">
                        📍 {currentTenant.subdomain}.plantgen.live
                      </p>
                      {currentTenant.customDomain && (
                        <p className="text-gray-600">🌐 {currentTenant.customDomain}</p>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => (window.location.href = '/domain-settings')}>
                    🔗 Manage Domains
                  </Button>
                </div>
              </Card>

              {/* Create Page Section */}
              <Card className="mb-8">
                <h2 className="text-2xl font-bold mb-4">📄 Create New Page</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter page title (e.g., Home, About, Products)"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCreatePage}>
                    Create Page
                  </Button>
                </div>
                {message && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {message}
                  </div>
                )}
              </Card>

              {/* Pages List */}
              <Card>
                <h2 className="text-2xl font-bold mb-6">📑 Your Pages ({pages.length})</h2>
                {pages.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No pages created yet. Create your first page above!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pages.map((page: any) => (
                      <div key={page.id} className="border-l-4 border-blue-500 pl-4 py-3">
                        <h3 className="font-bold text-lg">{page.title}</h3>
                        <p className="text-sm text-gray-600">Slug: {page.slug}</p>
                        <p className="text-sm text-green-600 mt-2">URL: {page.url}</p>
                        <p className="text-xs text-gray-500 mt-1">Created: {new Date(page.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Theme Display */}
              <Card className="mt-8">
                <h2 className="text-2xl font-bold mb-4">🎨 Brand Theme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-2">Theme Color:</p>
                    <div className="flex items-center space-x-3">
                      <div
                        style={{ backgroundColor: currentTenant.themeColor }}
                        className="h-16 w-16 rounded-lg border-2 border-gray-300"
                      />
                      <code className="bg-gray-100 px-3 py-2 rounded">{currentTenant.themeColor}</code>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Status:</p>
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                      {currentTenant.status}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
