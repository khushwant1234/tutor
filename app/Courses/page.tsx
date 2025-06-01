"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";
import CourseCard from "@/components/courses/CourseCard";
import Footer from "@/components/footer/Footer";
import supabase from "@/utils/supabase/client";
import { Search, X, FilterIcon, BookOpen, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
  isEnrolled?: boolean;
  price?: number;
  is_free?: boolean;
  currency?: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    "All",
    "Enrolled",
    "Science",
    "Math",
    "Technology",
    "Languages",
  ];

  useEffect(() => {
    async function fetchUserAndCourses() {
      try {
        setLoading(true);

        // First, get the current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch all courses from the database
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*");

        if (coursesError) throw coursesError;

        // If user is logged in, check enrollments
        if (currentUser) {
          // Get user enrollments
          const { data: enrollments, error: enrollmentsError } = await supabase
            .from("user_data")
            .select("course_id")
            .eq("user_id", currentUser.id);

          if (enrollmentsError) throw enrollmentsError;

          // Create a set of enrolled course IDs for faster lookup
          const enrolledCourseIds = new Set(
            enrollments?.map((e) => e.course_id) || []
          );

          // Mark courses as enrolled if they're in the user's enrollments
          const coursesWithEnrollment =
            coursesData?.map((course) => ({
              ...course,
              isEnrolled: enrolledCourseIds.has(course.id),
            })) || [];

          setCourses(coursesWithEnrollment);
          setFilteredCourses(coursesWithEnrollment);
        } else {
          setCourses(coursesData || []);
          setFilteredCourses(coursesData || []);
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

  // Search and filter functionality
  useEffect(() => {
    let result = [...courses];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description &&
            course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (activeFilter === "Enrolled") {
      result = result.filter((course) => course.isEnrolled);
    } else if (activeFilter !== "All") {
      // This is a placeholder - you'll need to add category field to your courses data
      // result = result.filter(course => course.category === activeFilter);
    }

    setFilteredCourses(result);
  }, [searchTerm, activeFilter, courses]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 py-20">
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/5 backdrop-blur-sm"></div>
          <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-white/5 backdrop-blur-sm"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-cyan-50 font-medium text-sm mb-6">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Explore and Learn</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Perfect <span className="text-cyan-200">Course</span>
            </h1>
            <p className="text-cyan-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
              Discover high-quality learning experiences designed to help you
              acquire new skills and knowledge for your future success
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-md mx-auto relative">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden ring-2 ring-white/30 transition-all hover:ring-white/50 focus-within:ring-white/50">
                <Search className="ml-5 h-5 w-5 text-cyan-500" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 py-4 px-4 focus:outline-none text-gray-700 placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="p-2 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4 flex-grow">
        {/* Enhanced Filter Section */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Available Courses
              </h2>
              <motion.span
                className="ml-3 bg-cyan-100 text-cyan-800 text-sm font-medium px-3 py-1 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {filteredCourses.length} courses
              </motion.span>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter Courses
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Animated Filter Chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-500 mb-3">
                    Filter by category:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeFilter === filter
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Course Listings */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center h-64 py-16"
          >
            <div className="relative">
              <div className="w-16 h-16 border-t-4 border-b-4 border-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">
              Loading your courses...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 p-8 rounded-xl text-center border border-red-100 shadow-sm max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="h-8 w-8 text-red-500"
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
            <h3 className="text-xl font-semibold text-gray-800">
              Unable to load courses
            </h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </motion.div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-xl text-center border border-gray-200 shadow-sm max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-50 rounded-full mb-6">
              <svg
                className="h-10 w-10 text-cyan-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">
              No courses found
            </h3>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              {searchTerm || activeFilter !== "All"
                ? "We couldn't find any courses matching your current search criteria. Try adjusting your filters or search terms."
                : "There are no courses available at the moment. Please check back later for new offerings."}
            </p>
            {(searchTerm || activeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
                className="mt-6 inline-flex items-center px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    desc={course.description}
                    image_url={course.image_url}
                    instructor={course.instructor}
                    isEnrolled={course.isEnrolled}
                    price={course.price}
                    is_free={course.is_free}
                    currency={course.currency}
                  />
                </motion.div>
              ))}
            </div>

            {/* "No more courses" message at the bottom when all are shown */}
            <div className="text-center mt-12 py-6 border-t border-gray-100">
              <p className="text-gray-500">
                {filteredCourses.length === courses.length
                  ? "You've reached the end of the list. Showing all available courses."
                  : `Showing ${filteredCourses.length} of ${courses.length} courses.`}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recommended CourseCard improvements */}
      {/* 
      To make your CourseCard component prettier, consider these enhancements:
      1. Add subtle hover effects (shadow increase, slight scale)
      2. Include instructor avatar images
      3. Add rating stars or student count
      4. Use badges for popular or new courses
      5. Add a visual indicator for enrolled courses
      6. Include course duration or lesson count information
      */}

      <Footer />
    </div>
  );
};

export default CoursesPage;
