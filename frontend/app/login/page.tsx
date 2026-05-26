'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { Card, Button, Input } from '@/app/components/UI';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }

      if (user.role === 'superadmin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800">
              <strong>Admin:</strong> admin / admin123
            </p>
            <p className="text-xs text-blue-800">
              <strong>Client 1:</strong> client1admin / password123
            </p>
            <p className="text-xs text-blue-800">
              <strong>Client 2:</strong> client2admin / password123
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
