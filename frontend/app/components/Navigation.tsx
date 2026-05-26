'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              PlantGen
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.username}</span>
                {user.role === 'superadmin' && (
                  <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">
                    Admin
                  </Link>
                )}
                {user.tenantId && (
                  <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
