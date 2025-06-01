"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react"; // Import ShieldCheck icon

interface PagesPhoneProps {
  isLoggedIn: boolean;
  isAdmin?: boolean; // Add isAdmin property
  userEmail?: string;
}

const PagesPhone = ({ isLoggedIn, isAdmin, userEmail }: PagesPhoneProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/Login");
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sm:hidden">
      <Button variant="ghost" onClick={toggleMenu}>
        {isOpen ? <X /> : <Menu />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleMenu}>
          <div
            className="absolute right-0 top-0 h-screen w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
              <Button variant="ghost" onClick={toggleMenu}>
                <X />
              </Button>
            </div>
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/"
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Home
              </Link>{" "}
              {isLoggedIn && (
                <Link
                  href="/Dashboard"
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  Dashboard
                </Link>
              )}
              {isLoggedIn && (
                <Link
                  href="/Notes"
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  Notes
                </Link>
              )}
              {/* Add Admin link that only shows for admin users */}
              {isLoggedIn && isAdmin && (
                <Link
                  href="/Admin"
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded flex items-center"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/Courses"
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Explore Courses
              </Link>
              {isLoggedIn ? (
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="mt-4"
                >
                  Logout
                </Button>
              ) : (
                <Link
                  href="/Login"
                  onClick={toggleMenu}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesPhone;
