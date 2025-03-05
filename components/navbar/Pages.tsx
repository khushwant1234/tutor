"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

interface PagesProps {
  isLoggedIn: boolean;
  userEmail?: string;
}

const Pages = ({ isLoggedIn, userEmail }: PagesProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="hidden sm:flex gap-5 items-center">
      <Link href="/" className="text-white hover:text-gray-300">
        Home
      </Link>
      <Link href="/Courses" className="text-white hover:text-gray-300">
        Courses
      </Link>
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <span className="text-white">{userEmail}</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-white hover:text-gray-300"
          >
            Logout
          </Button>
        </div>
      ) : (
        <Link href="/Login">
          <Button variant="outline" className="text-white hover:text-gray-300">
            Login
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Pages;
