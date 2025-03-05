"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from 'next/navigation';
import supabase from "@/utils/supabase/client";

interface PagesPhoneProps {
  isLoggedIn: boolean;
  userEmail?: string;
}

const PagesPhone = ({ isLoggedIn, userEmail }: PagesPhoneProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="sm:hidden flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/Icons/Bars.svg"
            alt="Pages"
            width={28}
            height={28}
          ></Image>
        </SheetTrigger>
        <SheetContent className="bg-[#071952]">
          <SheetHeader>
            <SheetTitle className="text-center text-white">Pages</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Link href="/">Home</Link>
            <Link href="/Courses">Courses</Link>
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-600">{userEmail}</span>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/Login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PagesPhone;
