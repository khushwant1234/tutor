import React from "react";
import Link from "next/link";

const Card = ({ name, desc }: { name: string; desc: string }) => {
  return (
    <Link href="/">
      <div className="flex flex-col h-56 w-80 px-6 items-center justify-center gap-2 border-2 border-black rounded-2xl bg-[#d0bfff] m-2 sm:w-96 max-[320px]:w-72 transition transform hover:scale-110 duration-300 hover:drop-shadow-xl hover:shadow-black">
        <div className="text-black text-2xl font-bold">{name}</div>
        <div className=" text-center text-black text-lg">{desc}</div>
      </div>
    </Link>
  );
};

export default Card;
