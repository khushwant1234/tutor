"use client";

import React from "react";
import Navbar from "@/components/home/Navbar";
import { Courses } from "@/data/Courses";
import CourseCard from "@/components/courses/CourseCard";
import Footer from "@/components/footer/Footer";

const CoursesPage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Courses?.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              desc={course.description}
              id={course.id}
              image={course.image_url}
              instructor={course.instructor}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;