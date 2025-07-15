"use client";

import React, { useEffect, useState } from "react";
import Card from "./Card";
import { motion } from "framer-motion";
import supabase from "@/utils/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
  slug?: string;
}

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);

        // Fetch courses from Supabase
        // You can adjust the query to get specific featured courses
        // For example, add .eq('featured', true) or limit the number returned
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        setCourses(data || []);
      } catch (err: unknown) {
        console.error("Error fetching featured courses:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with accent line */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <div className="h-1.5 w-1/2 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full"></div>
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most popular learning experiences designed to boost
            your skills
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-t-4 border-b-4 border-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-500 font-medium">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100 shadow-sm max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Unable to load courses
            </h3>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="bg-gray-50 p-8 rounded-xl text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No courses available
            </h3>
            <p className="mt-2 text-gray-500">
              Check back soon for new course offerings!
            </p>
          </div>
        )}

        {/* Course cards with staggered animation */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card
                  name={course.title}
                  desc={course.description}
                  image={
                    course.image_url || `/Images/course-${(idx % 5) + 1}.jpg`
                  }
                  slug={`/Courses/${course.slug || course.id}`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* View all courses button */}
        <div className="mt-12 text-center">
          <a
            href="/Courses"
            className="inline-flex items-center px-8 py-4 border-0 text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            View All Courses
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
