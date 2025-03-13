"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pages from "@/components/navbar/Pages";
import PagesPhone from "../navbar/PagesPhone";
import supabase from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(session?.user);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Get current user directly from auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("No user found or error:", userError);
          setUser(null);
          setIsAdmin(false);
          return;
        }
        
        // Set user state
        setUser(user);
        
        // Check if user has admin role in user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single
        
        console.log("Admin check result:", data);
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
        
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAdmin(false);
      }
    };
    
    checkUserSession();
  }, []); // No dependencies to avoid duplicate calls

  // Keep this useEffect for handling auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user);
      setUser(session?.user ?? null);
      
      // When user logs out, reset isAdmin
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
      
      // When user logs in, check admin status
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!error) {
            setIsAdmin(data?.role === 'admin' || false);
          }
        } catch (err) {
          console.error("Error checking admin on login:", err);
          setIsAdmin(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/Login');
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="flex justify-between items-center p-5 bg-[#071952] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-white">EduSite</h1>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <Pages isLoggedIn={!!user} isAdmin={isAdmin} />
        <PagesPhone isLoggedIn={!!user} isAdmin={isAdmin} /> {/* Pass isAdmin prop here */}
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{getInitials(user?.user_metadata?.display_name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.user_metadata?.display_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/Profile')}>
                  Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Navbar;
