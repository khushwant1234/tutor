// components/AdminProtected.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading, checkAdmin, refreshSession } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      setChecking(true);
      
      // Force refresh session to ensure we have latest auth state
      await refreshSession();
      
      // If not logged in, redirect to login
      if (!user && !isLoading) {
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Check admin status
      const isUserAdmin = await checkAdmin();
      
      // If not admin, redirect to home
      if (!isUserAdmin) {
        console.log('Not admin, redirecting to home');
        router.push('/');
        return;
      }
      
      setChecking(false);
    };

    checkAuthentication();
  }, [user, isLoading]);

  if (isLoading || checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}