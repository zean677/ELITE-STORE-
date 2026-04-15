import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (adminOnly && user.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [user, loading, adminOnly, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && user.role !== 'admin') return null;

  return <>{children}</>;
}
