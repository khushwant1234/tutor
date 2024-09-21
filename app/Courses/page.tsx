import React from "react";
import Navbar from "@/components/home/Navbar";
import { Courses } from "@/data/Courses";
import CourseCard from "@/components/courses/CourseCard";

const page = () => {
  return (
    <div>
      <Navbar></Navbar>
      <div className="">
        {Courses?.map((course, idx) => (
          <CourseCard
            key={idx}
            title={course.title}
            desc={course.description}
          ></CourseCard>
        ))}
      </div>
    </div>
  );
};

export default page;
