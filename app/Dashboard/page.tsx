"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  AlertCircle,
  Calendar,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import supabase from "@/utils/supabase/client";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor?: string;
  preview_url?: string;
  other_info?: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  course_id: string;
  course_title?: string;
  instructor?: string;
  meeting_link?: string;
  status?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState<UpcomingClass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Simple custom modal
  const SimpleModal = ({
    open,
    onClose,
    children
  }: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!open) return null;
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  };

  const refreshDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Please log in to view your dashboard");
      }
      
      // Get enrolled courses
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("user_data")
        .select("course_id")
        .eq("user_id", user.id);
        
      if (enrollmentError) throw enrollmentError;
      
      if (!enrollmentData || enrollmentData.length === 0) {
        setEnrolledCourses([]);
        setUpcomingClasses([]);
        return;
      }
      
      const courseIds = enrollmentData.map(item => item.course_id);
      
      // Get course data
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);
        
      if (courseError) throw courseError;
      setEnrolledCourses(courseData || []);
      
      // Get upcoming classes for these courses
      const now = new Date().toISOString();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      console.log("Fetching classes for course IDs:", courseIds);
      
      const { data: classData, error: classError } = await supabase
        .from("class_instances")
        .select(`
          id,
          title,
          start_time,
          end_time,
          meeting_link,
          status,
          course_classes(course_id)
        `)
        .gte("start_time", now)
        .lte("start_time", nextWeek.toISOString())
        .in("course_classes.course_id", courseIds)
        .order("start_time", { ascending: true });
        
      if (classError) {
        console.error("Error fetching classes:", classError);
        throw classError;
      }
      
      console.log("Class data received:", classData);
      
      if (classData && classData.length > 0) {
        const upcoming = classData.filter(cls => cls.course_classes).map(cls => {
          const startDate = new Date(cls.start_time);
          const endDate = new Date(cls.end_time);
          const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
          
          // Add null check for course_classes
          const courseId = cls.course_classes?.course_id;
          if (!courseId) {
            console.log("Missing course_id for class:", cls.id);
          }
          
          const course = courseData.find(c => c.id === courseId);
          
          return {
            id: cls.id,
            title: cls.title,
            date: startDate.toLocaleDateString(),
            time: startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            duration: durationMins,
            course_id: courseId || "unknown",  // Provide fallback
            course_title: course?.title || "Unknown Course",
            meeting_link: cls.meeting_link,
            status: cls.status
          };
        }).filter(item => item.course_id !== "unknown");  // Filter out items with unknown course_id
        
        console.log("Upcoming classes processed:", upcoming);
        setUpcomingClasses(upcoming);
      } else {
        console.log("No upcoming classes found");
        setUpcomingClasses([]);
      }
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Please log in to view your dashboard");
        }
        setUser(user);

        // Get user's enrolled courses
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("user_data")
          .select("course_id")
          .eq("user_id", user.id);

        if (enrollmentError) throw enrollmentError;

        if (enrollmentData && enrollmentData.length > 0) {
          const courseIds = enrollmentData.map((item) => item.course_id);

          const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("*")
            .in("id", courseIds);

          if (courseError) throw courseError;
          setEnrolledCourses(courseData || []);

          try {
            const now = new Date().toISOString();
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            const { data: classData, error: classError } = await supabase
              .from("class_instances")
              .select(`
                id,
                title,
                start_time,
                end_time,
                meeting_link,
                status,
                course_classes(course_id)
              `)
              .gte("start_time", now)
              .lte("start_time", nextWeek.toISOString())
              .in("course_classes.course_id", courseIds)
              .order("start_time", { ascending: true });

            if (classError) {
              console.error("Error fetching classes:", classError);
              if (classError.message?.includes("does not exist")) {
                // If a table doesn't exist, do nothing here or handle differently
              } else {
                throw classError;
              }
            } else if (classData && classData.length > 0) {
              const upcoming = classData.map((cls) => {
                const startDate = new Date(cls.start_time);
                const endDate = new Date(cls.end_time);
                const durationMins = Math.round(
                  (endDate.getTime() - startDate.getTime()) / 60000
                );
                const courseId = cls.course_classes.course_id;
                const course = (courseData || []).find((c) => c.id === courseId);

                return {
                  id: cls.id,
                  title: cls.title,
                  date: startDate.toLocaleDateString(),
                  time: startDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }),
                  duration: durationMins,
                  course_id: courseId,
                  course_title: course?.title || "Unknown Course",
                  meeting_link: cls.meeting_link,
                  status: cls.status
                };
              });

              setUpcomingClasses(upcoming);
            }
          } catch (err) {
            console.error("Error with class data:", err);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );

        if (err instanceof Error && err.message.includes("log in")) {
          router.push("/Login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  useEffect(() => {
    refreshDashboardData();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name =
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      "there";

    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const handleClassSelect = (cls: UpcomingClass) => {
    setSelectedClass(cls);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 p-4 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
            <span className="text-red-600">{error}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your courses
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              onClick={refreshDashboardData}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Link href="/Courses">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse All Courses
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Upcoming classes */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Upcoming Classes
                </CardTitle>
                <CardDescription>
                  Your scheduled classes for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming classes scheduled.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Check back later for new class schedules.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-gray-500">
                              {cls.course_title}
                            </span>
                          </div>
                          <h3 className="font-medium">{cls.title}</h3>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {cls.date} • {cls.time} • {cls.duration} mins
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-4 md:mt-0"
                          onClick={() => handleClassSelect(cls)}
                        >
                          Join Class
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {upcomingClasses.length > 0 && (
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600"
                    onClick={() => alert("Calendar view coming soon!")}
                  >
                    View Full Calendar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          {/* Right column - Enrolled courses & quick links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Courses you're currently enrolled in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      You haven't enrolled in any courses yet.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/Courses">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 space-x-1">
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <Link href={`/Courses/${course.id}`} key={course.id}>
                        <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                          {course.image_url ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden mr-3">
                              <Image
                                src={course.image_url}
                                alt={course.title}
                                fill
                                className="object-cover"
                                unoptimized={true}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                              <BookOpen className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {course.title}
                            </h4>
                            {course.instructor && (
                              <p className="text-xs text-gray-500 truncate">
                                by {course.instructor}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              {enrolledCourses.length > 3 && (
                <CardFooter className="border-t pt-4">
                  <Link href="/MyCourses" className="w-full">
                    <Button variant="outline" className="w-full text-blue-600">
                      See All Courses
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/Profile">
                      <span className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">P</span>
                        </div>
                        Edit Profile
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/MyCourses">
                      <span className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-medium">M</span>
                        </div>
                        My Courses
                      </span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => alert("Coming soon!")}
                  >
                    <span className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600 font-medium">C</span>
                      </div>
                      Certificate Progress
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <SimpleModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedClass && (
          <>
            <h2 className="text-xl font-semibold mb-2">Join Class</h2>
            <p className="text-gray-500 mb-4">
              You're about to join {selectedClass.title}
            </p>
            <div className="rounded-md bg-blue-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Video className="h-5 w-5 text-blue-400 mr-2" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    {selectedClass.course_title}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {selectedClass.date} at {selectedClass.time}
                    </p>
                    <p className="mt-1">
                      Duration: {selectedClass.duration} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedClass.meeting_link) {
                    window.open(selectedClass.meeting_link, "_blank");
                  }
                  setModalOpen(false);
                }}
                disabled={!selectedClass.meeting_link}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {selectedClass.meeting_link ? "Join Now" : "No Link Available"}
              </Button>
            </div>
          </>
        )}
      </SimpleModal>
    </div>
  );
};

export default Dashboard;