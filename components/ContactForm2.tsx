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

    setSubmitted(true);
    console.log("Form submitted", formData);

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
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 transform -skew-y-6 z-0 rounded-3xl shadow-xl"></div>

      <div
        className={cn(
          "relative z-10 w-full max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-xl overflow-hidden",
          className
        )}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent">
                Get in Touch
              </h2>
              <p className="mt-4 text-gray-600">
                Have questions about our courses? Want to learn more about how
                we can help you achieve your educational goals? Reach out to us
                today!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-cyan-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-md font-medium text-gray-900">
                  +91 98765 43210
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-cyan-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4 text-md font-medium text-gray-900">
                  contact@edusite.com
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={50}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="johndoe@gmail.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Dropdown */}
              <div>
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700"
                >
                  Class
                </label>
                <select
                  name="class"
                  id="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <select
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                maxLength={150}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Enter your message (150 characters)"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold py-3 px-4 rounded-md hover:from-cyan-700 hover:to-blue-800 transition-all duration-200 shadow-md"
              >
                Send Message
              </button>
            </div>

            {/* Confirmation message after submission */}
            {submitted && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p>Form submitted successfully! We'll contact you soon.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm2;
