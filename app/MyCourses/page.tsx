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

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function fetchPurchasedCourses() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Please log in to view your courses");
          return;
        }

        setUser(user);

        const { data: userData, error: userDataError } = await supabase
          .from("user_data")
          .select("course_id")
          .eq("user_id", user.id);

        if (userDataError) throw userDataError;

        if (!userData || userData.length === 0) {
          setCourses([]);
          return;
        }

        const courseIds = userData.map((item) => item.course_id);

        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);

        if (coursesError) throw coursesError;

        setCourses(coursesData || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    }

    fetchPurchasedCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />{" "}
      <div className="container mx-auto py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>

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
            <h3 className="text-xl font-medium text-gray-700">
              No courses purchased yet
            </h3>
            <p className="mt-2 text-gray-500">
              Browse our catalog to find courses that interest you.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  desc={course.description}
                  id={course.id}
                  image_url={course.image_url || ""}
                  instructor={course.instructor || ""}
                  isEnrolled={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyCourses;
