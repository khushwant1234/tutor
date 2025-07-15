"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Pages from "@/components/navbar/Pages";
import PagesPhone from "../navbar/PagesPhone";
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
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount and when auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set avatar URL if user exists
      if (data.session?.user) {
        const metadata = data.session.user.user_metadata;
        setAvatarUrl(metadata?.image_url || metadata?.avatar_url || undefined);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);

        if (session?.user) {
          const metadata = session.user.user_metadata;
          setAvatarUrl(
            metadata?.image_url || metadata?.avatar_url || undefined
          );
        } else {
          setAvatarUrl(undefined);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setAvatarUrl(
        user.user_metadata?.image_url ||
          user.user_metadata?.avatar_url ||
          undefined
      );
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAvatarUrl(undefined);
    router.push("/Login");
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word?.[0] || "")
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <nav className="bg-blue-700 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1
          className="text-white text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          EduSite
        </h1>{" "}
        <Pages
          isLoggedIn={isAuthenticated}
          isAdmin={isAdmin === null ? undefined : isAdmin}
        />
        <PagesPhone
          isLoggedIn={isAuthenticated}
          isAdmin={isAdmin === null ? undefined : isAdmin}
        />
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {getInitials(user?.user_metadata?.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.display_name ||
                          user?.user_metadata?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/Profile")}>
                      Profile
                    </DropdownMenuItem>{" "}
                    {isAdmin === true && (
                      <DropdownMenuItem onClick={() => router.push("/Admin")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-white border border-white/30 hover:bg-white/10"
                onClick={() => router.push("/Login")}
              >
                Log in
              </Button>
              <Button
                variant="default"
                className="bg-white text-blue-700 hover:bg-white/90"
                onClick={() => router.push("/Register")}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
