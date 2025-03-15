"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/utils/supabase/client";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  refresh: async () => {},
  refreshUserData: async () => {},
});

// Pages that require authentication
const PROTECTED_ROUTES = ['/Dashboard', '/Profile', '/MyCourses'];
// Pages that require admin access
const ADMIN_ROUTES = ['/Admin'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.role === 'admin';
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        setUser(data.user);
        const adminStatus = await checkUserRole(data.user.id);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      setUser(data.user);
    }
  };

  // Check routes for auth/admin requirements
  useEffect(() => {
    if (isLoading) return;

    // Handle protected routes
    if (PROTECTED_ROUTES.includes(pathname) && !user) {
      router.push('/Login');
    }

    // Handle admin routes
    if (ADMIN_ROUTES.includes(pathname) && (!user || !isAdmin)) {
      router.push('/Dashboard');
    }
  }, [pathname, user, isAdmin, isLoading, router]);

  useEffect(() => {
    refresh();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          const adminStatus = await checkUserRole(session.user.id);
          setIsAdmin(adminStatus);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Add this function to the context value
  const contextValue = {
    user,
    isLoading,
    isAdmin,
    refresh,
    refreshUserData,  // Add this to context
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);