import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  desc: string;
  image_url?: string;
  instructor?: string;
  isEnrolled?: boolean;
}

const CourseCard = ({ id, title, desc, image_url, instructor, isEnrolled }: CourseCardProps) => {
  // Trim the description for the card
  function trimDescription(text: string, maxLength: number = 300) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative">
      {isEnrolled && (
        <div className="absolute top-4 -right-1 z-20">
          <div className="bg-green-500 text-white px-4 py-1 font-medium rounded-l-full flex items-center shadow-md">
            <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
            Enrolled
          </div>
          <div className="absolute -bottom-2 right-0 w-0 h-0 
                        border-t-8 border-t-green-700
                        border-r-8 border-r-transparent"></div>
        </div>
      )}
      
      {image_url ? (
        <div className="relative h-48 w-full">
          <Image 
            src={image_url} 
            alt={title}
            fill
            unoptimized={true}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{trimDescription(desc)}</p>
          
          {instructor && (
            <p className="text-sm text-gray-500 mb-4">
              Instructor: {instructor}
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 mt-auto">
          <Link href={`/Courses/${id}`}>
            <Button variant="outline">Learn More</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
