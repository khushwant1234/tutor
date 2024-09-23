"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Pages from "@/components/navbar/Pages";
import PagesPhone from "../navbar/PagesPhone";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-5 bg-[#071952] sticky top-0 z-50 ">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-white">EduSite</h1>
      </div>
      <Pages></Pages>
      <PagesPhone></PagesPhone>
    </div>
  );
};

export default Navbar;
