import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PagesPhone = () => {
  const [position, setPosition] = useState("bottom");
  return (
    <div className="sm:hidden flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Image
              src="/Icons/Bars.svg"
              alt="Pages"
              width={28}
              height={28}
            ></Image>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <Link href="/">
              <DropdownMenuRadioItem value="home">Home</DropdownMenuRadioItem>
            </Link>
            <Link href="/Courses">
              <DropdownMenuRadioItem value="courses">
                My Courses
              </DropdownMenuRadioItem>
            </Link>
            <Link href="/Notes">
              <DropdownMenuRadioItem value="notes">Notes</DropdownMenuRadioItem>
            </Link>
            <Link href="/About">
              <DropdownMenuRadioItem value="about">
                About Us
              </DropdownMenuRadioItem>
            </Link>
            <Link href="/Settings">
              <DropdownMenuRadioItem value="settings">
                Settings
              </DropdownMenuRadioItem>
            </Link>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PagesPhone;
