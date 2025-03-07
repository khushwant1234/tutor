"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";
import CourseCard from "@/components/courses/CourseCard";
import Footer from "@/components/footer/Footer";
import supabase from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
  isEnrolled?: boolean;
}
const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function fetchUserAndCourses() {
      try {
        setLoading(true);
        
        // First, get the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        // Fetch all courses from the database
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) throw coursesError;
        
        // If user is logged in, check enrollments
        if (currentUser) {
          // Get user enrollments
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from('user_data')
            .select('course_id')
            .eq('user_id', currentUser.id);
            
          if (enrollmentsError) throw enrollmentsError;
          
          // Create a set of enrolled course IDs for faster lookup
          const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || []);
          
          // Mark courses as enrolled if they're in the user's enrollments
          const coursesWithEnrollment = coursesData?.map(course => ({
            ...course,
            isEnrolled: enrolledCourseIds.has(course.id)
          })) || [];
          
          setCourses(coursesWithEnrollment);
          
        } else {
          setCourses(coursesData || []);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserAndCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-500 text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium text-gray-700">No courses available</h3>
            <p className="mt-2 text-gray-500">Check back later for new courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                desc={course.description}
                image_url={course.image_url}
                instructor={course.instructor}
                isEnrolled={course.isEnrolled}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;