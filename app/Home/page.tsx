"use client";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Footer from "@/components/footer/Footer";
import ContactForm2 from "@/components/ContactForm2";
import FeaturedCourses from "@/components/home/FeaturedCourses";

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <Hero></Hero>
      <FeaturedCourses></FeaturedCourses>
      {/* <div className="flex justify-center my-5">
        <LoginForm></LoginForm>
      </div> */}
      <ContactForm2 className=""></ContactForm2>
      <Footer></Footer>
    </div>
  );
}
