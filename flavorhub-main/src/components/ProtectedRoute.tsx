import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(requireAdmin);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        setIsAdmin(false);
        return;
      }

      if (!requireAdmin) {
        setCheckingRole(false);
        return;
      }

      // Check admin role from user object (comes from JWT)
      setIsAdmin(user.role === 'admin');
      setCheckingRole(false);
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading, requireAdmin]);

  useEffect(() => {
    if (authLoading || checkingRole) return;

    if (requireAuth && !user) {
      navigate(redirectTo);
      return;
    }

    if (requireAdmin && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, authLoading, checkingRole, requireAuth, requireAdmin, navigate, redirectTo]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
