"use client";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Footer from "@/components/footer/Footer";
import ContactForm2 from "@/components/ContactForm2";
import FeaturedCourses from "@/components/home/FeaturedCourses";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FeaturedCourses />
        </div>
        <section className="bg-gradient-to-b from-white to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactForm2 className="shadow-2xl" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
