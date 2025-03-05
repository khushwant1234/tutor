import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  desc: string;
  image_url?: string;
  instructor?: string;
}

const CourseCard = ({ id, title, desc, image_url, instructor }: CourseCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
      
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{desc}</p>
        
        {instructor && (
          <p className="text-sm text-gray-500 mb-4">
            Instructor: {instructor}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <Link href={`/course/${id}`}>
            <Button variant="outline">Learn More</Button>
          </Link>
          <Link href={`/enroll/${id}`}>
            <Button>Enroll</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
