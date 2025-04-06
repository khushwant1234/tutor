"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    name?: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  checkAdmin: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  checkAdmin: async () => false,
  signOut: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to check if user is an admin
  const checkAdmin = async (): Promise<boolean> => {
    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        console.error("Error checking admin status:", userError);
        setIsAdmin(false);
        return false;
      }

      // Check admin role in user_metadata
      if (currentUser.user_metadata?.role === "admin") {
        setIsAdmin(true);
        return true;
      }

      // Or check admin table
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (adminError) {
        console.error("Error checking admin table:", adminError);
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(!!adminData);
      return !!adminData;
    } catch (error) {
      console.error("Admin check error:", error);
      setIsAdmin(false);
      return false;
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error refreshing session:", error);
        setUser(null);
        setIsAdmin(false);
        return;
      }

      if (session) {
        setUser(session.user);
        await checkAdmin();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/login");
  };

  // Initialize and listen for auth changes
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth initialization error:", error);
          return;
        }

        if (session) {
          setUser(session.user);
          await checkAdmin();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session) {
        setUser(session.user);
        await checkAdmin();
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, checkAdmin, signOut, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
