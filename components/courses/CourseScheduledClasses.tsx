"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  VideoIcon,
  Loader2,
  AlertCircle,
  CalendarDays,
  Timer,
} from "lucide-react";
import supabase from "@/utils/supabase/client";

interface ScheduledClass {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  status?: string;
  recurring?: boolean;
}

interface CourseScheduledClassesProps {
  courseId: string;
  userId: string;
  courseName: string;
}

export default function CourseScheduledClasses({
  courseId,
  userId,
  courseName,
}: CourseScheduledClassesProps) {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledClasses();
  }, [courseId, userId]);

  const fetchScheduledClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if the user is enrolled in the course
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("user_data")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (enrollmentError) {
        throw enrollmentError;
      }

      if (!enrollmentData) {
        setError(
          "You must be enrolled in this course to view scheduled classes."
        );
        return;
      }

      // Get current time to filter future and ongoing classes
      const now = new Date().toISOString(); // Fetch class instances for this course
      const { data: classInstancesData, error: classInstancesError } =
        await supabase
          .from("class_instances")
          .select(
            `
          id,
          title,
          start_time,
          end_time,
          meeting_link,
          status,
          class_id,
          course_classes!inner(
            course_id,
            description,
            recurring
          )
        `
          )
          .eq("course_classes.course_id", courseId)
          .gte("start_time", now)
          .order("start_time", { ascending: true });

      if (classInstancesError) {
        throw classInstancesError;
      } // Transform the data
      const transformedClasses: ScheduledClass[] = (
        classInstancesData || []
      ).map((instance) => {
        const courseClass = Array.isArray(instance.course_classes)
          ? instance.course_classes[0]
          : instance.course_classes;

        return {
          id: instance.id,
          title: instance.title,
          description: courseClass?.description,
          start_time: instance.start_time,
          end_time: instance.end_time,
          meeting_link: instance.meeting_link,
          status: instance.status,
          recurring: courseClass?.recurring,
        };
      });

      setClasses(transformedClasses);
    } catch (err) {
      console.error("Error fetching scheduled classes:", err);
      setError("Failed to load scheduled classes.");
    } finally {
      setLoading(false);
    }
  };
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMins = Math.round(durationMs / (1000 * 60));

    if (durationMins >= 60) {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return `${durationMins}m`;
  };

  const getTimeUntilClass = (startTime: string) => {
    const now = new Date();
    const classTime = new Date(startTime);
    const diffMs = classTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays >= 1) {
      return `in ${Math.ceil(diffDays)} day${
        Math.ceil(diffDays) !== 1 ? "s" : ""
      }`;
    } else if (diffHours >= 1) {
      return `in ${Math.ceil(diffHours)} hour${
        Math.ceil(diffHours) !== 1 ? "s" : ""
      }`;
    } else if (diffMs > 0) {
      const diffMins = Math.ceil(diffMs / (1000 * 60));
      return `in ${diffMins} minute${diffMins !== 1 ? "s" : ""}`;
    } else {
      return "starting soon";
    }
  };

  const isClassStartingSoon = (startTime: string) => {
    const now = new Date();
    const classTime = new Date(startTime);
    const diffMs = classTime.getTime() - now.getTime();
    return diffMs > 0 && diffMs <= 30 * 60 * 1000; // 30 minutes
  };

  const handleJoinClass = (meetingLink: string) => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    } else {
      alert("Meeting link not available yet");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-gray-600">
            Loading scheduled classes...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Upcoming Classes
        </h3>
        <p className="text-gray-500">
          There are no scheduled classes for <strong>{courseName}</strong> at
          the moment.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Check back later or contact your instructor for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Showing {classes.length} upcoming class
        {classes.length !== 1 ? "es" : ""} for <strong>{courseName}</strong>
      </div>

      {classes.map((cls) => {
        const { date, time } = formatDateTime(cls.start_time);
        const duration = getDuration(cls.start_time, cls.end_time);
        const timeUntil = getTimeUntilClass(cls.start_time);
        const isStartingSoon = isClassStartingSoon(cls.start_time);

        return (
          <Card
            key={cls.id}
            className={`transition-all hover:shadow-md ${
              isStartingSoon ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cls.title}
                    </h3>
                    {cls.recurring && (
                      <Badge variant="outline" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                    {isStartingSoon && (
                      <Badge className="bg-blue-500 text-white text-xs animate-pulse">
                        Starting Soon
                      </Badge>
                    )}
                  </div>

                  {cls.description && (
                    <p className="text-gray-600 text-sm">{cls.description}</p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>{duration}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span
                      className={`font-medium ${
                        isStartingSoon ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {timeUntil}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {cls.meeting_link ? (
                    <Button
                      onClick={() => handleJoinClass(cls.meeting_link!)}
                      className={`${
                        isStartingSoon ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Join Class
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Link Coming Soon
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
