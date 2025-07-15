import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface CardProps {
  name: string;
  desc: string;
  image?: string;
  slug?: string;
}

const Card: React.FC<CardProps> = ({
  name,
  desc,
  image = "/Images/default-course.jpg",
  slug = "#",
}) => {
  return (
    <Link href={slug} className="block h-full">
      <motion.div
        className="h-full bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        whileHover={{ y: -5 }}
      >
        {/* Card Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image || "https://placehold.co/600x400"}
            alt={name}
            fill
            unoptimized={true}
            className="object-cover transition-all duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Card badge */}
          <span className="inline-block px-3 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full mb-3">
            Featured
          </span>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600">
            {name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">{desc}</p>

          {/* Card Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-500 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-600">4.9</span>
            </div>

            <span className="flex items-center text-cyan-600 text-sm font-medium">
              Learn More
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default Card;
