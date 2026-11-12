import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
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
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !checkingRole) {
      if (!user) {
        navigate('/auth');
      } else if (isAdmin === false) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, checkingRole, navigate]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="theme-admin">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <AdminSidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
              <SidebarTrigger />
              <Button variant="outline" size="sm" asChild>
                <Link to="/" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Back to Site
                </Link>
              </Button>
            </header>
            <div className="flex-1 p-6 bg-background">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
