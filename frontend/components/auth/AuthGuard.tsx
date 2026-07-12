'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'advisor' | 'admin';
}

export default function AuthGuard({ children, requireAuth = true, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    const userStr = localStorage.getItem('finplan_user');
    let userRole = '';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = user.role || '';
      } catch (e) {
        // ignore parse error
      }
    }

    if (requireAuth) {
      // Protected route - redirect to login if not authenticated
      if (!token) {
        router.push('/login');
      } else {
        // Check role requirement if specified
        if (requiredRole && userRole !== requiredRole) {
          // Redirect to appropriate dashboard based on role
          if (userRole === 'advisor') {
            router.push('/advisor-dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }
        setIsAuthenticated(true);
      }
    } else {
      // Public route - redirect to dashboard if already authenticated
      if (token) {
      if (userRole === 'advisor') {
        router.push('/advisor-dashboard');
      } else {
        router.push('/dashboard');
      }
      } else {
        setIsAuthenticated(true);
      }
    }

    setIsLoading(false);
  }, [requireAuth, requiredRole, router]);

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