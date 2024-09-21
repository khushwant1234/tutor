import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex justify-between items-center p-6 bg-[#57C5B6]">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Link href="/About">
        <p className="text-[#ffffff]">Support</p>
      </Link>
    </div>
  );
};

export default Footer;
