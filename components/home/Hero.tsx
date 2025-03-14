"use client";
import React from "react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { motion } from "framer-motion";

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
    <section className="relative min-h-[85vh] flex items-center justify-center">
      {/* Background with improved overlay gradient */}
      <div className="absolute inset-0 bg-[url('/Images/BookShelfH3.jpg')] bg-cover bg-center bg-no-repeat"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Desktop typewriter */}
        <div className="justify-center w-full hidden sm:flex">
          <TypewriterEffectSmooth
            words={words}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white w-full justify-center"
          />
        </div>

        {/* Mobile typewriter */}
        <div className="flex justify-center w-full sm:hidden">
          <div className="flex flex-col items-center justify-center mx-2">
            <TypewriterEffectSmooth
              words={wordssm}
              className="text-4xl font-bold text-white"
            />
            <TypewriterEffectSmooth
              words={wordssm1}
              className="text-4xl font-bold"
            />
          </div>
        </div>

        {/* Subheading */}
        <p className="mt-6 text-xl text-cyan-100 max-w-2xl mx-auto">
          Personalized learning experiences to help you achieve your educational
          goals
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href="/courses"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg shadow-lg hover:bg-cyan-600 transition-all"
          >
            Explore Courses
          </motion.a>
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-transparent text-white border-2 border-white font-medium rounded-lg hover:bg-white/10 transition-all"
          >
            Sign Up Free
          </motion.a>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg
            className="w-6 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
