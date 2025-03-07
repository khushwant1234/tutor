"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import supabase from "@/utils/supabase/client";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
}

interface UserData {
  id: string;
  email?: string;
}

export default function CourseDetails() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    async function fetchCourseAndEnrollment() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user as UserData);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Check enrollment if user is logged in
        if (user) {
          const { data: enrollmentData } = await supabase
            .from('user_data')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', params.id)
            .maybeSingle();

          setIsEnrolled(!!enrollmentData);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseAndEnrollment();
  }, [params.id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      if (!user) {
        alert("Please log in to enroll in courses");
        return;
      }
      
      const { error } = await supabase
        .from('user_data')
        .insert([
          {
            user_id: user.id,
            course_id: params.id,
          }
        ]);
        
      if (error) throw error;
      setIsEnrolled(true);
      
    } catch (err: unknown) {
      console.error("Error enrolling in course:", err);
      alert(err instanceof Error ? err.message : "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex-grow">
          <div className="text-center">Course not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-4xl mx-auto">
          {course.image_url && (
            <div className="relative h-[400px] w-full mb-6 rounded-lg overflow-hidden">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                unoptimized={true}
                className="object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          
          {course.instructor && (
            <p className="text-lg text-gray-600 mb-4">
              Instructor: {course.instructor}
            </p>
          )}

          <div className="prose max-w-none mb-8">
            <p>{course.description}</p>
          </div>

          <div className="mt-8">
            {isEnrolled ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="text-lg">You are enrolled in this course</span>
              </div>
            ) : (
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
                size="lg"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : 'Enroll in Course'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
