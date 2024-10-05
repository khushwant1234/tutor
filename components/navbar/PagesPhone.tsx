import React from "react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const PagesPhone = () => {
  const [position, setPosition] = useState("bottom");
  return (
    <div className="sm:hidden flex gap-2">
      {/* <DropdownMenu>
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
      </DropdownMenu> */}
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
          <div className="">
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/">
                <Button className="w-full text-black bg-white">Home</Button>
              </Link>
              <Link href="/Courses">
                <Button className="w-full text-black bg-white">
                  My Courses
                </Button>
              </Link>
              <Link href="/Notes">
                <Button className="w-full text-black bg-white">Notes</Button>
              </Link>
              <Link href="/About">
                <Button className="w-full text-black bg-white">About Us</Button>
              </Link>
              <Link href="/Settings">
                <Button className="w-full text-black bg-white">Settings</Button>
              </Link>
            </div>
            {/* <div className="">
              <SheetClose asChild>
                <Link href="/">
                  <Button type="submit" className="w-full">
                    Logout
                  </Button>
                </Link>
              </SheetClose>
            </div> */}
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PagesPhone;
