"use client";
import React from "react";
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
import { useRouter } from 'next/navigation';
import supabase from "@/utils/supabase/client";

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

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
    <nav className="bg-blue-700 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-white">EduSite</h1>
        
        <Pages 
          isLoggedIn={!!user} 
          isAdmin={isAdmin}
          userEmail={user?.email}
        />
        
        <PagesPhone isLoggedIn={!!user} isAdmin={isAdmin} />
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src={user.user_metadata?.image_url || user.user_metadata?.avatar_url} />
                  <AvatarFallback>{getInitials(user?.user_metadata?.full_name)}</AvatarFallback>
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
    </nav>
  );
};

export default Navbar;
