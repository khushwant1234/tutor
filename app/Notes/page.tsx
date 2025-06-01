"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/footer/Footer";
import CourseNotesDropdown from "@/components/courses/CourseNotesDropdown";
import supabase from "@/utils/supabase/client";
import { Loader2, FileText } from "lucide-react";

const NotesPage = () => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Course Notes
            </h1>
            <p className="text-gray-600">
              Please log in to access your course materials and notes.
            </p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Course Notes & Materials
          </h1>
          <p className="text-gray-600">
            Access and download notes for all your enrolled courses.
          </p>
        </div>

        <CourseNotesDropdown userId={user.id} />
      </div>
      <Footer />
    </div>
  );
};

export default NotesPage;
