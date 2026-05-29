'use client';

import { useEffect, useState } from 'react';
import { useTenantStore } from '@/lib/store';
import { pageAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button } from '@/app/components/UI';

export default function PagesList() {
  const { currentTenant } = useTenantStore();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentTenant) loadPages(currentTenant.id);
    else setLoading(false);
  }, [currentTenant]);

  const loadPages = async (tenantId: number) => {
    setLoading(true);
    try {
      const res = await pageAPI.getByTenant(tenantId);
      setPages(res.data || []);
    } catch (e) {
      console.error('Failed to load pages', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!currentTenant) return;
    if (!confirm('Delete this page?')) return;
    try {
      await pageAPI.delete(id, currentTenant.id);
      await loadPages(currentTenant.id);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Card>
            <h1 className="text-3xl font-bold mb-4">📄 Pages</h1>
            {!currentTenant ? (
              <p className="text-gray-600">No tenant selected. Visit the dashboard to create or select a tenant.</p>
            ) : loading ? (
              <p>Loading...</p>
            ) : pages.length === 0 ? (
              <p className="text-gray-600">No pages found for {currentTenant.company}.</p>
            ) : (
              <div className="space-y-3">
                {pages.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-gray-500">/{p.slug} • {p.url}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => window.open(p.url, '_blank')}>Open</Button>
                      <Button onClick={() => handleDelete(p.id)} className="bg-red-600">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
