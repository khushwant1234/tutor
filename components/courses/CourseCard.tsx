import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import supabase from "@/utils/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  desc: string;
  image_url?: string;
  instructor?: string;
  hideEnroll?: boolean; // Used for MyCourses page where we don't need enroll button
}

const CourseCard = ({ id, title, desc, image_url, instructor, hideEnroll = false }: CourseCardProps) => {
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is already enrolled in this course
    const checkEnrollment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (!user) return;

        const { data } = await supabase
          .from('user_data')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .maybeSingle();
          
        setIsEnrolled(!!data);
      } catch (err) {
        console.error("Error checking enrollment:", err);
      }
    };
    
    checkEnrollment();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      // Check if user is logged in
      if (!user) {
        alert("Please log in to enroll in courses");
        return;
      }
      
      // Enroll the user (add to user_data table)
      const { error } = await supabase
        .from('user_data')
        .insert([
          {
            user_id: user.id,
            course_id: id,
          }
        ]);
        
      if (error) throw error;
      
      // Update state to show enrolled
      setIsEnrolled(true);
      
    } catch (err: any) {
      console.error("Error enrolling in course:", err);
      alert(err.message || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

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
          
          {!hideEnroll && (
            isEnrolled ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span>Enrolled</span>
              </div>
            ) : (
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : 'Enroll'}
              </Button>
            )
          )}
          
          {hideEnroll && (
            <Link href={`/course/${id}/learn`}>
              <Button>Go to Course</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
