import React from "react";
import { courseInfo } from "@/data/FeaturedCourses";
import Card from "./Card";

const Hero = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <hr className="border-2 border-black w-full hidden sm:block" />
      <h2 className="py-5 pt-10 text-6xl font-bold text-center">
        Featured Courses:
      </h2>
      <div className="flex flex-wrap justify-center py-5 pb-10 gap-2">
        {courseInfo?.map((course, idx) => (
          <Card key={idx} name={course.title} desc={course.desc}></Card>
        ))}
      </div>
      <hr className="border-2 border-black w-full" />
    </div>
  );
};

export default Hero;
