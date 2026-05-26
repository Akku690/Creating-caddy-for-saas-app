'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token, setToken, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        setToken(savedToken);
        verifyToken(savedToken);
      } else {
        router.push('/login');
      }
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await authAPI.verify(token);
      if (response.data.valid && response.data.payload) {
        setUser(response.data.payload);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
