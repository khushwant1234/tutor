import React from "react";
import Navbar from "@/components/home/Navbar";
import { Courses } from "@/data/Courses";
import CourseCard from "@/components/courses/CourseCard";
import Footer from "@/components/footer/Footer";

const page = () => {
  return (
    <div>
      <Navbar></Navbar>
      <div className="">
        {Courses?.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            desc={course.description}
            id={course.id}
          ></CourseCard>
        ))}
      </div>
      <Footer></Footer>
    </div>
  );
};

export default page;
