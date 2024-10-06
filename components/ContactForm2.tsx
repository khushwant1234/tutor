import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  class: string;
  subject: string;
  phone: string;
  email: string;
  message: string;
}

interface ContactFormProps {
  className: string;
}

const ContactForm2: React.FC<ContactFormProps> = ({ className }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    class: "",
    subject: "",
    phone: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple form validation
    if (
      !formData.name ||
      !formData.class ||
      !formData.subject ||
      !formData.phone ||
      !formData.email ||
      !formData.message
    ) {
      alert("Please fill out all fields.");
      return;
    }

    // Submit logic here (e.g., send data to a server)
    setSubmitted(true);
    console.log("Form submitted", formData);

    // Clear the form
    setFormData({
      name: "",
      class: "",
      subject: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto my-8 p-6 bg-white sm:rounded-lg sm:shadow-lg",
        className
      )}
    >
      <h2 className="text-2xl font-bold mb-6 text-[#6255C3]">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={50} // Limit to 50 characters
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={50} // Limit to 50 characters
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="johndoe@gmail.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="+91 XXXXXXXXXX"
          />
        </div>

        {/* Class Dropdown */}
        <div>
          <label
            htmlFor="class"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Class
          </label>
          <select
            name="class"
            id="class"
            value={formData.class}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Select your class
            </option>
            {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Subject
          </label>
          <select
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Select a subject
            </option>
            {[
              "Physics",
              "Chemistry",
              "Maths",
              "Biology",
              "Social Studies",
              "English",
              "Hindi",
              "Sanskrit",
              "Computer Science",
            ].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-[#6255C3]"
          >
            Message
          </label>
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            maxLength={150} // Limit to 150 characters
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter your message (150 characters)"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-[#7C6EDB] text-white font-bold py-2 px-4 rounded hover:bg-[#6255C3] transition"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Confirmation message after submission */}
      {submitted && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <p>Form submitted successfully!</p>
        </div>
      )}
    </div>
  );
};

export default ContactForm2;
