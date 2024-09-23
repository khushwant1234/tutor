import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Pages = () => {
  return (
    <div className="items-center gap-5 hidden sm:flex">
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
      <div className="text-white hover:text-black">
        <Link href="/Settings">
          <Button variant="ghost" className="hover:bg-white">
            <p className="">Settings</p>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Pages;
