"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Pages from "@/components/navbar/Pages";
import PagesPhone from "../navbar/PagesPhone";
import supabase from "@/utils/supabase/client";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex justify-between items-center p-5 bg-[#071952] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-white">EduSite</h1>
      </div>
      <Pages isLoggedIn={!!user} userEmail={user?.email} />
      <PagesPhone isLoggedIn={!!user} userEmail={user?.email} />
    </div>
  );
};

export default Navbar;
