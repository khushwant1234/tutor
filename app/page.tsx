"use client";
import Navbar from "@/components/home/Navbar";
import Featured from "@/components/home/Featured";
import Footer from "@/components/footer/Footer";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <Featured></Featured>
      {/* <div className="flex justify-center my-5">
        <LoginForm></LoginForm>
      </div> */}
      <ContactForm className=""></ContactForm>
      <Footer></Footer>
    </div>
  );
}
