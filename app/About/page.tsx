"use client";
import React from "react";
import Navbar from "@/components/home/Navbar";
import Image from "next/image";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ContactForm2 from "@/components/ContactForm2";

const page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar></Navbar>

      <div className="flex gap-32 flex-wrap sm:flex-nowrap mx-0 sm:mx-5 mt-10 justify-center">
        <div className="flex flex-col gap-3 pb-3 w-auto items-center sm:items-start sm:w-1/2 mx-1 sm:mx-0 ">
          <h2 className="text-5xl">
            <b>Name</b>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="text-2xl text-center sm:text-start">
              Teacher _ , Phd in _
            </p>
            <p className="text-xl font-medium text-center sm:text-start">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Placeat,
              accusamus? Adipisci facere ex architecto inventore aspernatur
              eligendi quaerat Lorem ipsum dolor sit amet consectetur,
              adipisicing elit. Placeat, accusamus? Adipisci facere ex
              architecto inventore aspernatur eligendi quaerat Lorem ipsum dolor
              sit amet consectetur, adipisicing elit. Placeat, accusamus?
              Adipisci facere ex architecto inventore aspernatur eligendi
              quaerat
            </p>
          </div>
        </div>
        <div className="h-96 w-96 border-0 rounded-xl overflow-hidden mx-1 sm:mx-0 ">
          <Image
            src="/Images/khush.jpg"
            alt="Image"
            className="border-0 rounded-xl"
            width={384}
            height={384}
            layout="responsive"
          />
        </div>
      </div>
      <div className="my-5 flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#7C6EDB] hover:bg-[#6255C3] transition w-full mx-5"
            >
              Contact Us
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 ">
            <ContactForm2 className="my-0"></ContactForm2>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-auto">
        <Footer></Footer>
      </div>
    </div>
  );
};

export default page;
