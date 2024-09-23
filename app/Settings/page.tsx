import React from "react";
import Navbar from "@/components/home/Navbar";
import AccountInfo from "@/components/settings/AccountInfo";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const page = () => {
  return (
    <div>
      <Navbar></Navbar>
      <div className="mt-4">
        <div className="mt-4 flex flex-col my-1  mx-1 sm:my-10 sm:mx-10 ">
          <h2 className="text-2xl sm:text-3xl text-center sm:text-start mb-5">
            Settings
          </h2>
          <AccountInfo></AccountInfo>
        </div>
        <Separator></Separator>
        <div className="mt-4 flex flex-col my-1  mx-1 sm:my-10 sm:mx-10 ">
          <Button>Logout</Button>
        </div>
        <Separator></Separator>
      </div>
    </div>
  );
};

export default page;
