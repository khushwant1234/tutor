"use client";

import { useEffect, useState } from 'react';
import LoginForm from "./Login/page";
import RegisterForm from './Register/page';
import Home from "./Home/page";
import CheckMail from "./CheckMail/page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Check } from 'lucide-react';
import Wrapper from './Wrapper/page';
import { Courses } from '@/data/Courses';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Define async function inside useEffect
    async function fetchData() {
      // try {
      //   // Your async operation here
      //   const response = await fetch('your-api-endpoint');
      //   const result = await response.json();
      //   setData(result);
      // } catch (error) {
      //   console.error('Error fetching data:', error);
      // }
    }

    // Call the async function
    fetchData();
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<LoginForm />} />
        <Route path="/Register" element={<RegisterForm />} />
        <Route path="/SuccessMail" element={<CheckMail />} />
        <Route path="/Cources" element={<Courses />} />
      </Routes>
    </BrowserRouter>
  );
}