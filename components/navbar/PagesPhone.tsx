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
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/Icons/Bars.svg"
            alt="Pages"
            width={28}
            height={28}
          ></Image>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center">Pages</SheetTitle>
          </SheetHeader>
          <div className="">
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/">
                <Button className="w-full ">Home</Button>
              </Link>
              <Link href="/Courses">
                <Button className="w-full ">My Courses</Button>
              </Link>
              <Link href="/Notes">
                <Button className="w-full ">Notes</Button>
              </Link>
              <Link href="/About">
                <Button className="w-full ">About Us</Button>
              </Link>
              <Link href="/Settings">
                <Button className="w-full ">Settings</Button>
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
