"use client";
import React, { useEffect } from "react";
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
import { NotificationBell } from '@/components/notifications/NotificationBell'; // Ensure this path is correct or update it to the correct path

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(undefined);

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
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.user_metadata?.image_url || user.user_metadata?.avatar_url || undefined);
      console.log(avatarUrl);
    }
  }, [user]);
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

        <div className="flex items-center space-x-2">
          {/* Add notification bell before avatar dropdown */}
          {user && <NotificationBell />}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {getInitials(user?.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.user_metadata?.display_name || user?.user_metadata?.full_name}</p>
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
    </nav>
  );
};

export default Navbar;
