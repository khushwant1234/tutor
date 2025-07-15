"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import supabase from "@/utils/supabase/client";
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";

// Helper function to format date with ordinal suffix
const formatDateWithOrdinal = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  const getOrdinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

interface ClassInstance {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  status?: string;
  course_classes:
    | {
        course_id: string;
      }[]
    | {
        course_id: string;
      };
  course_title?: string;
}

const CalendarPage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Simple modal component
  const SimpleModal = ({
    open,
    onClose,
    children,
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

  useEffect(() => {
    fetchUserAndClasses();
  }, [currentMonth]);

  const fetchUserAndClasses = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in to view your calendar");
      }

      // Get user's enrolled courses
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("user_data")
        .select("course_id")
        .eq("user_id", user.id);

      if (enrollmentError) throw enrollmentError;

      if (!enrollmentData || enrollmentData.length === 0) {
        setClasses([]);
        return;
      }

      const courseIds = enrollmentData.map((item) => item.course_id);

      // Get courses data for titles
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      if (courseError) throw courseError;

      // Get classes for the current month
      const monthStart = startOfMonth(currentMonth).toISOString();
      const monthEnd = endOfMonth(currentMonth).toISOString();

      const { data: classData, error: classError } = await supabase
        .from("class_instances")
        .select(
          `
          id,
          title,
          start_time,
          end_time,
          meeting_link,
          status,
          course_classes!inner(
            course_id
          )
        `
        )
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd)
        .in("course_classes.course_id", courseIds)
        .order("start_time", { ascending: true });

      if (classError) throw classError;

      // Enhance class data with course titles
      const enhancedClasses = (classData || []).map((cls) => {
        const courseClass = Array.isArray(cls.course_classes)
          ? cls.course_classes[0]
          : cls.course_classes;
        const courseId = courseClass?.course_id;
        const course = courseData?.find((c) => c.id === courseId);

        return {
          ...cls,
          course_title: course?.title || "Unknown Course",
        };
      });

      setClasses(enhancedClasses);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load calendar data"
      );

      if (err instanceof Error && err.message.includes("log in")) {
        router.push("/Login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getClassesForDate = (date: Date) => {
    return classes.filter((cls) => isSameDay(parseISO(cls.start_time), date));
  };

  const getDatesWithClasses = () => {
    return classes.map((cls) => parseISO(cls.start_time));
  };

  const handleClassSelect = (cls: ClassInstance) => {
    setSelectedClass(cls);
    setModalOpen(true);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
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

  const selectedDateClasses = getClassesForDate(selectedDate);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Class Calendar</h1>
          <p className="text-gray-600">
            View all your scheduled classes in calendar format
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    {format(currentMonth, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on any date to view scheduled classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  modifiers={{
                    hasClasses: getDatesWithClasses(),
                  }}
                  modifiersStyles={{
                    hasClasses: {
                      backgroundColor: "#3b82f6",
                      color: "white",
                      borderRadius: "50%",
                    },
                  }}
                  className="rounded-md border"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Days with scheduled classes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classes for Selected Date */}
          <div>
            <Card>
              {" "}
              <CardHeader>
                <CardTitle>
                  Classes on {formatDateWithOrdinal(selectedDate)}
                </CardTitle>
                <CardDescription>
                  {selectedDateClasses.length} class(es) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No classes scheduled for this date
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateClasses.map((cls) => {
                      const startTime = parseISO(cls.start_time);
                      const endTime = parseISO(cls.end_time);
                      const duration = Math.round(
                        (endTime.getTime() - startTime.getTime()) / 60000
                      );

                      return (
                        <div
                          key={cls.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleClassSelect(cls)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {cls.title}
                              </h4>
                              <p className="text-sm text-blue-600 mb-2">
                                {cls.course_title}
                              </p>
                              <div className="flex items-center text-sm text-gray-600 space-x-3">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{format(startTime, "HH:mm")}</span>
                                </div>
                                <span>•</span>
                                <span>{duration} mins</span>
                              </div>
                            </div>
                            {cls.meeting_link && (
                              <Button size="sm" variant="outline">
                                <Video className="h-3 w-3 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {classes.length}
                    </div>
                    <div className="text-xs text-blue-600">Total Classes</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {getDatesWithClasses().length}
                    </div>
                    <div className="text-xs text-green-600">Active Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />

      {/* Class Detail Modal */}
      <SimpleModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedClass && (
          <>
            <h2 className="text-xl font-semibold mb-2">Class Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedClass.title}
                </h3>
                <p className="text-sm text-blue-600">
                  {selectedClass.course_title}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {" "}
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">
                      {format(parseISO(selectedClass.start_time), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <p className="font-medium">
                      {format(parseISO(selectedClass.start_time), "HH:mm")} -{" "}
                      {format(parseISO(selectedClass.end_time), "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
                {selectedClass.meeting_link && (
                  <Button
                    onClick={() => {
                      window.open(selectedClass.meeting_link, "_blank");
                      setModalOpen(false);
                    }}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Class
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SimpleModal>
    </div>
  );
};

export default CalendarPage;
