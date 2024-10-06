"use client";
import React from "react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";

const Hero = () => {
  const words = [
    {
      text: "Learning",
    },
    {
      text: "Made",
    },
    {
      text: "Easy",
    },
    {
      text: "with",
    },
    {
      text: "EduSite.",
      className: "text-cyan-400 dark:text-cyan-400",
    },
  ];

  const wordssm = [
    {
      text: "Learning",
    },
    {
      text: "Made",
    },
    {
      text: "Easy",
    },
  ];

  const wordssm1 = [
    {
      text: "with",
    },
    {
      text: "EduSite.",
      className: "text-cyan-400 dark:text-cyan-400",
    },
  ];
  return (
    <div>
      <section className="relative h-screen">
        {/* Pseudo-element with the blurred background */}
        <div className="absolute inset-0 bg-[url('/Images/BookShelfH3.jpg')] bg-cover bg-center bg-no-repeat filter blur-sm"></div>
        {/* Content on top of the blurred background */}

        <div className="relative flex items-center justify-center h-full bg-black bg-opacity-40">
          <div className="justify-center shrink-0 w-full hidden sm:flex">
            <TypewriterEffectSmooth
              words={words}
              className="max-[960px]:my-60 my-80 text-7xl w-full justify-center hover:drop-shadow-lg"
            ></TypewriterEffectSmooth>
          </div>
          <div className="flex justify-center shrink-0 w-full sm:hidden">
            <div className="flex flex-col items-center justify-center sm:hidden mx-2 ">
              <p className=""></p>
              <TypewriterEffectSmooth
                words={wordssm}
                className=""
              ></TypewriterEffectSmooth>
              <TypewriterEffectSmooth
                words={wordssm1}
                className=""
              ></TypewriterEffectSmooth>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
