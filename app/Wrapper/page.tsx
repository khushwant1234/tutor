"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import supabase from "@/utils/supabase/client";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          setAuthenticated(false);
        } else {
          setAuthenticated(!!session);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authenticated) {
    router.push('/Login');
    return null;
  }

  return <>{children}</>;
}