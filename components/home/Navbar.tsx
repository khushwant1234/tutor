"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const Navbar = () => {
  const [position, setPosition] = React.useState("bottom");
  return (
    <div className="flex justify-between items-center p-5 bg-[#071952] sticky top-0 z-50 ">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-white">EduSite</h1>
      </div>
      <div className="flex items-center gap-5 hidden sm:flex">
        <div className="text-white hover:text-black">
          <Link href="/">
            <Button variant="ghost" className="hover:bg-white">
              <p>Home</p>
            </Button>
          </Link>
        </div>
        <div className="text-white hover:text-black">
          <Link href="/Courses">
            <Button variant="ghost" className="hover:bg-white">
              <p>My Courses</p>
            </Button>
          </Link>
        </div>
        <div className="text-white hover:text-black">
          <Link href="/Notes">
            <Button variant="ghost" className="hover:bg-white">
              <p>Notes</p>
            </Button>
          </Link>
        </div>
        <div className="text-white hover:text-black">
          <Link href="/About">
            <Button variant="ghost" className="hover:bg-white">
              <p className="">About Us</p>
            </Button>
          </Link>
        </div>
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <img src="/Icons/Bars.svg" alt="Pages" className="h-7 w-7"></img>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={position}
              onValueChange={setPosition}
            >
              <Link href="/">
                <DropdownMenuRadioItem value="home">Home</DropdownMenuRadioItem>
              </Link>
              <Link href="/Courses">
                <DropdownMenuRadioItem value="courses">
                  My Courses
                </DropdownMenuRadioItem>
              </Link>
              <Link href="/Notes">
                <DropdownMenuRadioItem value="notes">
                  Notes
                </DropdownMenuRadioItem>
              </Link>
              <Link href="/About">
                <DropdownMenuRadioItem value="about">
                  About Us
                </DropdownMenuRadioItem>
              </Link>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
