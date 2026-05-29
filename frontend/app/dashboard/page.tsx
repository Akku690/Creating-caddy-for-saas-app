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
  const [newTenantCompany, setNewTenantCompany] = useState('');
  const [newTenantSubdomain, setNewTenantSubdomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'welcome' | 'create-account' | 'dashboard'>('welcome');

  useEffect(() => {
    resolveTenant();
  }, []);

  const resolveTenant = async () => {
    setIsLoading(true);
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      
      // First, check localStorage for previously created tenant
      const storedTenant = localStorage.getItem('currentTenant');
      if (storedTenant) {
        const tenant = JSON.parse(storedTenant);
        setCurrentTenant(tenant);
        await loadPages(tenant.id);
        setStep('dashboard');
        setIsLoading(false);
        return;
      }

      // If no stored tenant, resolve by hostname
      const response = await tenantAPI.resolve(hostname);
      if (response.data && !response.data.isMainSite) {
        setCurrentTenant(response.data);
        localStorage.setItem('currentTenant', JSON.stringify(response.data));
        await loadPages(response.data.id);
        setStep('dashboard');
      } else {
        // Main site - show welcome
        setStep('welcome');
      }
    } catch (error) {
      console.error('Error resolving tenant:', error);
      setStep('welcome');
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

  const handleCreateAccount = async () => {
    if (!newTenantCompany || !newTenantSubdomain) {
      setMessage('Please fill in company name and subdomain');
      return;
    }

    setIsLoading(true);
    try {
      const response = await tenantAPI.create({
        company: newTenantCompany,
        subdomain: newTenantSubdomain,
        email: 'admin@' + newTenantSubdomain + '.local',
      });
      setCurrentTenant(response.data);
      localStorage.setItem('currentTenant', JSON.stringify(response.data));
      setMessage(`✅ Account created! Your subdomain is: ${newTenantSubdomain}.plantgen.live`);
      setNewTenantCompany('');
      setNewTenantSubdomain('');
      await loadPages(response.data.id);
      setStep('dashboard');
      setTimeout(() => setMessage(''), 4000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error creating account');
      console.error(error);
    } finally {
      setIsLoading(false);
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
      setMessage(`✅ Page "${newPageTitle}" created! URL: ${response.data.url}`);
      setNewPageTitle('');
      await loadPages(currentTenant.id);
      setTimeout(() => setMessage(''), 4000);
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

  // STEP 1: Welcome Screen
  if (step === 'welcome') {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <h1 className="text-5xl font-bold mb-4 text-green-600">🎉 Welcome to PlantGen!</h1>
              <p className="text-xl text-gray-600 mb-8">
                Set up your SaaS account in just 2 steps
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="text-left p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h2 className="text-2xl font-bold mb-2">📝 Step 1: Create Your Account</h2>
                  <p className="text-gray-600 mb-4">
                    Enter your company name and choose a subdomain. You'll get automatic page allocation!
                  </p>
                  <div className="space-y-3">
                    <Input
                      id="tenant-company"
                      name="tenantCompany"
                      placeholder="e.g., Acme Corp"
                      value={newTenantCompany}
                      onChange={(e) => setNewTenantCompany(e.target.value)}
                      label="Company Name"
                    />
                    <div className="flex items-center space-x-2">
                      <Input
                        id="tenant-subdomain"
                        name="tenantSubdomain"
                        placeholder="e.g., acme"
                        value={newTenantSubdomain}
                        onChange={(e) => setNewTenantSubdomain(e.target.value)}
                        label="Subdomain"
                        className="flex-1"
                      />
                      <span className="text-gray-600 pt-6">.plantgen.live</span>
                    </div>
                    {message && (
                      <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                      </div>
                    )}
                    <Button onClick={handleCreateAccount} disabled={isLoading} className="w-full">
                      Create Account
                    </Button>
                  </div>
                </div>

                {/* Step 2 Preview */}
                <div className="text-left p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500 opacity-60">
                  <h2 className="text-2xl font-bold mb-2">🌐 Step 2: Connect Custom Domain (Optional)</h2>
                  <p className="text-gray-600">
                    After creating your account, you can connect your own custom domain like yourdomain.com
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>No credit card required</strong> • Start for free • Upgrade anytime
                </p>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // STEP 2+: Dashboard
  if (step === 'dashboard' && currentTenant) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <Card className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div
                    style={{ backgroundColor: currentTenant.themeColor }}
                    className="h-20 w-20 rounded-lg flex items-center justify-center text-3xl font-bold text-white"
                  >
                    {currentTenant.company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">{currentTenant.company}</h1>
                    <p className="text-gray-600 mt-2">
                      📍 <strong>{currentTenant.subdomain}.plantgen.live</strong>
                    </p>
                    {currentTenant.customDomain && (
                      <p className="text-gray-600">🌐 <strong>{currentTenant.customDomain}</strong> (verified)</p>
                    )}
                  </div>
                </div>
                {!currentTenant.customDomain && (
                  <Button onClick={() => (window.location.href = '/domain-settings')}>
                    🔗 Add Custom Domain
                  </Button>
                )}
              </div>
            </Card>

            {/* Create Page Section */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📄 Create New Page</h2>
              <p className="text-gray-600 mb-4">
                Each page you create will automatically get its own URL under your subdomain
              </p>
              <div className="flex gap-2">
                <Input
                  id="page-title"
                  name="pageTitle"
                  placeholder="e.g., Home, About, Products, Contact"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCreatePage}>
                  Create Page
                </Button>
              </div>
              {message && (
                <div className={`mt-4 p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
            </Card>

            {/* Pages List */}
            <Card>
              <h2 className="text-2xl font-bold mb-6">📑 Your Pages ({pages.length})</h2>
              {pages.length === 0 ? (
                <p className="text-gray-600 text-center py-12">
                  <span className="text-4xl mb-4 block">📝</span>
                  No pages created yet. Create your first page above to get started!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.map((page: any) => (
                    <div key={page.id} className="border-l-4 border-blue-500 pl-4 py-3 hover:shadow-lg rounded transition">
                      <h3 className="font-bold text-lg">{page.title}</h3>
                      <p className="text-sm text-gray-600">Slug: /{page.slug}</p>
                      <p className="text-sm text-green-600 mt-2 font-mono">
                        {page.url}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Next Steps */}
            <Card className="mt-8 bg-blue-50">
              <h3 className="text-xl font-bold mb-4">🚀 Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold">Account Created</p>
                    <p className="text-sm text-gray-600">Your subdomain is live and ready to use</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{pages.length > 0 ? '✅' : '⭕'}</span>
                  <div>
                    <p className="font-semibold">Create Pages</p>
                    <p className="text-sm text-gray-600">Add pages with automatic URLs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{currentTenant.customDomain ? '✅' : '⭕'}</span>
                  <div>
                    <p className="font-semibold">Connect Custom Domain (Optional)</p>
                    <p className="text-sm text-gray-600">
                      Link your own domain like {currentTenant.subdomain}.com
                    </p>
                    {!currentTenant.customDomain && (
                      <Button 
                        onClick={() => (window.location.href = '/domain-settings')}
                        className="mt-2 text-sm"
                      >
                        Set up custom domain
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return null;
}

export default function Dashboard() {
  return <DashboardContent />;
}
