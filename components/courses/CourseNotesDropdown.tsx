"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import supabase from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
}

interface CourseNote {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  course_id: string;
  tags: string[];
  created_at: string;
  course?: Course;
}

interface CourseNotesDropdownProps {
  userId: string;
}

const CourseNotesDropdown: React.FC<CourseNotesDropdownProps> = ({
  userId,
}) => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<CourseNote | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchEnrolledCourses();
    }
  }, [userId]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchCourseNotes();
    }
  }, [enrolledCourses]);
  const fetchEnrolledCourses = async () => {
    try {
      // Get courses the user is enrolled in from user_data table
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("user_data")
        .select("course_id, courses(id, title)")
        .eq("user_id", userId);

      console.log("Enrollments data:", enrollments);
      console.log("Enrollment error:", enrollmentError);

      if (enrollmentError) throw enrollmentError;

      const courses =
        enrollments?.map((enrollment) => enrollment.courses).filter(Boolean) ||
        [];
      setEnrolledCourses(courses.flat() as Course[]);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const fetchCourseNotes = async () => {
    if (enrolledCourses.length === 0) return;

    setLoading(true);
    try {
      const courseIds = enrolledCourses.map((course) => course.id);

      const { data, error } = await supabase
        .from("course_notes")
        .select(
          `
          *,
          course:courses(id, title)
        `
        )
        .in("course_id", courseIds)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourseNotes(data || []);
    } catch (error) {
      console.error("Error fetching course notes:", error);
    } finally {
      setLoading(false);
    }
  };
  const viewNote = async (note: CourseNote) => {
    setPdfLoading(true);
    setSelectedNote(note);
    try {
      const { data, error } = await supabase.storage
        .from("course-materials")
        .createSignedUrl(note.file_path, 60 * 60); // 1 hour expiry

      if (error) throw error;

      setPdfUrl(data.signedUrl);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const filteredNotes = courseNotes.filter((note) => {
    const matchesCourse =
      selectedCourse === "all" || note.course_id === selectedCourse;
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCourse && matchesSearch;
  });

  if (enrolledCourses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You are not enrolled in any courses yet.</p>
            <p className="text-sm">
              Course notes will appear here after enrollment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Course Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search-notes">Search Notes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search-notes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or tags..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter-course">Filter by Course</Label>
              <select
                id="filter-course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Courses</option>
                {enrolledCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {courseNotes.length === 0 ? (
                <>
                  <p>No course notes available yet.</p>
                  <p className="text-sm">
                    Notes will appear here when your instructors upload them.
                  </p>
                </>
              ) : (
                <>
                  <p>No notes match your search criteria.</p>
                  <p className="text-sm">
                    Try adjusting your search or filter options.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {note.title}
                        </h3>{" "}
                        <p className="text-sm text-blue-600 mb-2">
                          {note.course?.title || "Unknown Course"}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Size: {formatFileSize(note.file_size)}</span>
                          <span>
                            Added:{" "}
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>{" "}
                      <div className="ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => viewNote(note)}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View PDF
                            </Button>
                          </DialogTrigger>{" "}
                          <DialogContent className="w-[90vw] h-[90vh] max-w-none p-0 flex flex-col">
                            <DialogHeader className="p-4 pb-2 flex-shrink-0">
                              <DialogTitle>{selectedNote?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 px-4 pb-4">
                              {pdfLoading ? (
                                <div className="flex justify-center items-center h-full">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  <span className="ml-2">Loading PDF...</span>
                                </div>
                              ) : pdfUrl ? (
                                <iframe
                                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                  className="w-full h-full border rounded"
                                  title={`PDF Viewer - ${selectedNote?.title}`}
                                />
                              ) : (
                                <div className="text-center py-8 text-gray-500 h-full flex items-center justify-center">
                                  <p>Unable to load PDF</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseNotesDropdown;
