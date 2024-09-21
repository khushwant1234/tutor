import Link from "next/link";
import React from "react";

const CourseCard = ({ title, desc }: { title: string; desc: string }) => {
  return (
    <Link href="/Courses">
      <div className=" h-auto flex flex-col gap-3 bg-[#A594F9] border-white border-2 rounded-xl p-7 py-9 m-2 justify-center max-w-screen overflow-hidden">
        <h1 className="text-black text-3xl">{title}</h1>
        <p className="text-black text-xl">{desc}</p>
      </div>
    </Link>
  );
};

export default CourseCard;
