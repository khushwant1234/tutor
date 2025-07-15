"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import CourseSpecificNotes from "@/components/courses/CourseSpecificNotes";
import CourseScheduledClasses from "@/components/courses/CourseScheduledClasses";
import { NotificationList } from "@/components/NotificationList";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
  preview_url?: string;
  other_info?: string;
  isEnrolled?: boolean;
}

interface UserData {
  id: string;
  // Add other user properties as needed
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchCourseAndEnrollment() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user as UserData);

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", params.id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Check enrollment if user is logged in
        if (user) {
          const { data: enrollmentData } = await supabase
            .from("user_data")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", params.id)
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
  }, [params.id, supabase]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);

      if (!user) {
        alert("Please log in to enroll in courses");
        return;
      }

      const { error } = await supabase.from("user_data").insert([
        {
          user_id: user.id,
          course_id: params.id,
        },
      ]);

      if (error) throw error;
      setIsEnrolled(true);

      // Add this - show success message before redirecting
      alert("Successfully enrolled! Redirecting to dashboard...");

      // Redirect to dashboard to see updated classes
      setTimeout(() => {
        router.push("/Dashboard");
        // Force a refresh of the page to ensure data is reloaded
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      console.error("Error enrolling in course:", err);
      alert(err instanceof Error ? err.message : "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  // Add this function to extract YouTube video ID
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;

    // Handle different YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
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
          <div className="flex justify-between items-center mb-6">
            {isEnrolled && <NotificationList courseId={params.id} />}
          </div>

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
          {course.preview_url && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Course Preview</h2>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                {" "}
                <iframe
                  src={getYoutubeEmbedUrl(course.preview_url) || undefined}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          {course.instructor && (
            <p className="text-lg text-gray-600 mb-4">
              Instructor: {course.instructor}
            </p>
          )}
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-3">Course Description</h2>
            <div className="whitespace-pre-wrap">{course.description}</div>
          </div>
          {course.other_info && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-3">
                Additional Information
              </h2>
              <div className="prose max-w-none bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="whitespace-pre-wrap">{course.other_info}</div>
              </div>
            </div>
          )}
          <div className="mt-8">
            {isEnrolled ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="text-lg">You are enrolled in this course</span>
              </div>
            ) : (
              <Button onClick={handleEnroll} disabled={enrolling} size="lg">
                {enrolling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll in Course"
                )}
              </Button>
            )}
          </div>

          {/* Course Notes for Enrolled Students */}
          {isEnrolled && user?.id && (
            <>
              {/* Scheduled Classes Section */}
              <div className="mt-12 border-t pt-8">
                <CourseScheduledClasses
                  courseId={params.id}
                  userId={user.id}
                  courseName={course?.title || "Course"}
                />
              </div>
              <div className="mt-12 border-t pt-8">
                <CourseSpecificNotes courseId={params.id} userId={user.id} />
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
