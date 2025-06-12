"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/utils/supabase/client";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean | null;
  refresh: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: null,
  refresh: async () => {},
  refreshUserData: async () => {},
});

// Pages that require authentication
const PROTECTED_ROUTES = ["/Dashboard", "/Profile", "/MyCourses"];
// Pages that require admin access
const ADMIN_ROUTES = ["/Admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const checkUserRole = async (userId: string) => {
    try {
      // Check if user has admin role in user_roles table
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no role exists

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      // Return true if user has admin role, false otherwise
      return data && data.role === "admin";
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };
  const refresh = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        setUser(null);
        setIsAdmin(null);
        return;
      }

      if (user) {
        setUser(user);
        // Check admin status with the same pattern as Admin page
        const adminStatus = await checkUserRole(user.id);
        setIsAdmin(adminStatus);
        console.log(
          "Admin check result for user:",
          user.id,
          "is admin:",
          adminStatus
        );
      } else {
        setUser(null);
        setIsAdmin(null);
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      setUser(null);
      setIsAdmin(null);
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
      router.push("/Login");
    } // Handle admin routes
    if (ADMIN_ROUTES.includes(pathname) && (!user || isAdmin !== true)) {
      router.push("/Dashboard");
    }
  }, [pathname, user, isAdmin, isLoading, router]);

  useEffect(() => {
    refresh(); // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          const adminStatus = await checkUserRole(session.user.id);
          setIsAdmin(adminStatus);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(null);
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
    refreshUserData, // Add this to context
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
