import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

interface CourseCardProps {
  id: string;
  title: string;
  desc: string;
  image_url?: string;
  instructor?: string;
  isEnrolled?: boolean;
}

const CourseCard = ({
  id,
  title,
  desc,
  image_url,
  instructor,
  isEnrolled,
}: CourseCardProps) => {
  // Trim the description for the card
  function trimDescription(text: string, maxLength: number = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // Mock data for enhanced visual appeal
  const rating = 4.8;
  const students = Math.floor(Math.random() * 1000) + 50;
  const duration = Math.floor(Math.random() * 10) + 2;
  const modules = Math.floor(Math.random() * 10) + 4;

  // Random category for demo purposes
  const categories = ["Science", "Math", "Technology", "Languages"];
  const category = categories[Math.floor(Math.random() * categories.length)];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image section with overlay */}
      <div className="relative h-48 w-full overflow-hidden group">
        {image_url ? (
          <>
            <Image
              src={image_url}
              alt={title}
              fill
              unoptimized={true}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/5"></div>
          </>
        ) : (
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full w-full flex items-center justify-center text-white">
            <BookOpen className="h-16 w-16 opacity-30" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/80 text-cyan-700 hover:bg-white backdrop-blur-sm shadow-sm">
            {category}
          </Badge>
        </div>

        {/* Enrolled ribbon */}
        {isEnrolled && (
          <div className="absolute top-4 -right-1 z-20">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 font-medium rounded-l-full flex items-center shadow-md">
              <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
              Enrolled
            </div>
            <div
              className="absolute -bottom-2 right-0 w-0 h-0 
                          border-t-8 border-t-emerald-700
                          border-r-8 border-r-transparent"
            ></div>
          </div>
        )}

        {/* Course stats on image */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-white text-sm backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-white text-sm backdrop-blur-sm">
            <Users className="h-3 w-3 mr-1" />
            <span>{students}</span>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {trimDescription(desc)}
          </p>

          {/* Course stats */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1 text-cyan-600" />
              <span>{duration} hours</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <BookOpen className="h-4 w-4 mr-1 text-cyan-600" />
              <span>{modules} modules</span>
            </div>
          </div>

          {/* Instructor */}
          {instructor && (
            <div className="flex items-center mt-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                {instructor.slice(0, 2).toUpperCase()}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">
                  {instructor}
                </p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-4 mt-auto border-t border-gray-100">
          <Link href={`/Courses/${id}`} className="w-full block">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isEnrolled ? "Continue Learning" : "View Course"}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
