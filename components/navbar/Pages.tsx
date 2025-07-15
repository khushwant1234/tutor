"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react"; // Import ShieldCheck icon

interface PagesProps {
  isLoggedIn: boolean;
  isAdmin?: boolean; // Add isAdmin property
}

const Pages = ({ isLoggedIn, isAdmin }: PagesProps) => {
  return (
    <div className="hidden sm:flex gap-5 items-center">
      <Link href="/" className="text-white hover:text-gray-300">
        Home
      </Link>{" "}
      {isLoggedIn && (
        <Link href="/Dashboard" className="text-white hover:text-gray-300">
          Dashboard
        </Link>
      )}
      {isLoggedIn && (
        <Link href="/Calendar" className="text-white hover:text-gray-300">
          Calendar
        </Link>
      )}
      {isLoggedIn && (
        <Link href="/Notes" className="text-white hover:text-gray-300">
          Notes
        </Link>
      )}
      {/* Add Admin link that only shows up for admin users */}
      {isLoggedIn && isAdmin && (
        <Link
          href="/Admin"
          className="text-white hover:text-gray-300 flex items-center"
        >
          <ShieldCheck className="mr-1 h-4 w-4" />
          Admin
        </Link>
      )}
      <Link href="/Courses" className="text-white hover:text-gray-300">
        Explore Courses
      </Link>
      {!isLoggedIn && (
        <Link
          href="/Login"
          className="text-white hover:text-gray-300 underline"
        >
          Login
        </Link>
      )}
    </div>
  );
};

export default Pages;
