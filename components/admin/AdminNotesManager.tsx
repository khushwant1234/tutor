"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, FileText, Download, Eye, EyeOff } from "lucide-react";
import supabase from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
  is_public: boolean;
  created_at: string;
  course?: Course;
}

const AdminNotesManager = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Form state
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>("");
  const [isPublic, setIsPublic] = useState(true);

  // Filter state
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchNotes();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("course_notes")
        .select(
          `
          *,
          course:courses(id, title)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      event.target.value = "";
    }
  };

  const uploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCourse || !noteTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(`notes/${fileName}`, selectedFile);

      if (uploadError) throw uploadError;

      // Save note metadata to database
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      const { error: dbError } = await supabase.from("course_notes").insert({
        title: noteTitle,
        file_path: uploadData.path,
        file_size: selectedFile.size,
        course_id: selectedCourse,
        tags: tagsArray,
        is_public: isPublic,
      });

      if (dbError) throw dbError; // Reset form
      setNoteTitle("");
      setSelectedFile(null);
      setTags("");
      setSelectedCourse("");
      setIsPublic(true);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = ""; // Refresh notes list
      fetchNotes();
      toast({
        title: "Success!",
        description: "Note uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading note:", error);
      toast({
        title: "Upload Failed",
        description: "Error uploading note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  const togglePublicity = async (noteId: string, currentPublicity: boolean) => {
    try {
      const { error } = await supabase
        .from("course_notes")
        .update({ is_public: !currentPublicity })
        .eq("id", noteId);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error("Error updating publicity:", error);
      toast({
        title: "Update Failed",
        description: "Error updating publicity",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string, filePath: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from("course-materials")
        .remove([filePath]);

      if (storageError)
        console.warn("Error deleting file from storage:", storageError);

      // Delete record from database
      const { error: dbError } = await supabase
        .from("course_notes")
        .delete()
        .eq("id", noteId);

      if (dbError) throw dbError;
      fetchNotes();
      toast({
        title: "Success!",
        description: "Note deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Delete Failed",
        description: "Error deleting note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadNote = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("course-materials")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading note:", error);
      toast({
        title: "Download Failed",
        description: "Error downloading note",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const filteredNotes = notes.filter((note) => {
    const matchesCourse =
      filterCourse === "all" || note.course_id === filterCourse;
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Course Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={uploadNote} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-select">Course *</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="note-title">Note Title *</Label>
                <Input
                  id="note-title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  required
                />{" "}
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., lecture, assignment, exam"
              />
            </div>
            <div>
              <Label htmlFor="file-upload">PDF File *</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                required
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>{" "}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is-public">Make public to students</Label>
            </div>
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Note
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Notes</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or tags..."
              />
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter-course">Filter by Course</Label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Notes ({filteredNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notes found. Upload your first note above!
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
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {" "}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {note.title}
                          </h3>
                          <Badge
                            variant={note.is_public ? "default" : "secondary"}
                          >
                            {note.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>{" "}
                        <p className="text-sm text-gray-600 mb-2">
                          Course: {note.course?.title || "Unknown Course"}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
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
                        <p className="text-xs text-gray-500">
                          Size: {formatFileSize(note.file_size)} | Uploaded:{" "}
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {" "}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            togglePublicity(note.id, note.is_public)
                          }
                          title={
                            note.is_public ? "Make private" : "Make public"
                          }
                        >
                          {note.is_public ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadNote(note.file_path, note.title + ".pdf")
                          }
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteNote(note.id, note.file_path)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default AdminNotesManager;
