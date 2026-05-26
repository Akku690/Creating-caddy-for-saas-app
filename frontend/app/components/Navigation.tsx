'use client';

import Link from 'next/link';
import { useTenantStore } from '@/lib/store';

export function Navigation() {
  const { currentTenant } = useTenantStore();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-green-600">
              PlantGen
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <Link href="/domain-settings" className="text-sm text-blue-600 hover:text-blue-800">
                Domains
              </Link>
              <Link href="/pages" className="text-sm text-blue-600 hover:text-blue-800">
                Pages
              </Link>
              <Link href="/admin" className="text-sm text-purple-600 hover:text-purple-800 font-semibold">
                Admin
              </Link>
            </div>
          </div>
          {currentTenant && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{currentTenant.company}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
