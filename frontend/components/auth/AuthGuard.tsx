'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    
    if (requireAuth) {
      // Protected route - redirect to login if not authenticated
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    } else {
      // Public route - redirect to dashboard if already authenticated
      if (token) {
        router.push('/dashboard');
      } else {
        setIsAuthenticated(true);
      }
    }
    
    setIsLoading(false);
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="text-obsidian">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}